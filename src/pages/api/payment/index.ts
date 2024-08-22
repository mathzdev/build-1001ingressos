import { db } from '@/lib/firebaseClient';
import paymentGateways, { PaymentStatus } from '@/server/paymentGateways';
import { PaymentError } from '@/server/paymentGateways/error';
import { NextApiRequest, NextApiResponse } from 'next';

import { sendMail } from '@/lib/email/mailSender';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getCartById } from '@/server/db/carts/getCartById';
import { updateCartPayment } from '@/server/db/carts/updateCartPaymentDate';
import { TicketStatus } from '@/server/db/tickets/types';
import { ensureError } from '@/utils/error';
import { round } from '@/utils/number';
import {
    DocumentReference,
    Timestamp,
    addDoc,
    collection,
    doc,
    getDoc,
    increment,
    updateDoc,
} from 'firebase/firestore';
import { getServerSession } from 'next-auth/next';
import { Options, QRCodeCanvas } from 'styled-qr-code-node';
import { z } from 'zod';

function getRemoteIp(req: NextApiRequest) {
    let forwardedFor = req.headers['x-forwarded-for'];
    let remoteIp: string | undefined = '';
    if (forwardedFor) {
        forwardedFor =
            typeof forwardedFor === 'string' ? forwardedFor : forwardedFor[0];
        remoteIp = forwardedFor.split(',').shift() ?? req.socket.remoteAddress;
        remoteIp = remoteIp?.replace('::ffff:', '');
    }
    if (remoteIp === '::1' || remoteIp === '127.0.0.1') {
        remoteIp = undefined;
    }
    return remoteIp;
}

const schema = z.object({
    cartId: z.string(),
    paymentType: z.union([z.literal('CREDIT_CARD'), z.literal('PIX')]),
    cardData: z
        .object({
            creditCard: z.object({
                holderName: z.string(),
                number: z.string(),
                expiryMonth: z.string(),
                expiryYear: z.string(),
                ccv: z.string(),
            }),
            cardHolderInfo: z.object({
                name: z.string(),
                email: z.string(),
                cpfCnpj: z.string(),
                postalCode: z.string(),
                addressNumber: z.string(),
                phone: z.string(),
            }),
        })
        .optional(),
    customer: z.object({
        name: z.string(),
        cpfCnpj: z.string(),
        email: z.string(),
        phone: z.string().optional(),
        address: z.object({
            street: z.string(),
            number: z.string(),
            complement: z.string().optional(),
            neighborhood: z.string().optional(),
            zipCode: z.string(),
        }),
    }),
});

export function parseTicketStatus(paymentStatus: PaymentStatus): TicketStatus {
    switch (paymentStatus) {
        case 'APPROVED':
        case 'AUTHORIZED':
            return 'PAID';
        case 'IN_PROCESS':
            return 'PROCESSING_PAYMENT';
        case 'REFUNDED':
            return 'REFUNDED';
        case 'PENDING':
            return 'PENDING_PAYMENT';
        default:
            return 'INVALIDATED';
    }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'method_not_allowed',
            message: 'Method not allowed',
        });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        res.status(401).json({
            error: 'unauthorized',
            message: 'You must be logged in.',
        });
        return;
    }

    const remoteIp = getRemoteIp(req);

    const parseResponse = schema.safeParse(req.body);

    if (!parseResponse.success) {
        console.error(parseResponse.error);

        res.status(400).json({
            error: 'invalid_request',
            message: parseResponse.error.message,
        });
        return;
    }

    const { customer, cartId, paymentType, cardData } = parseResponse.data;

    const paymentGateway = paymentGateways[paymentType];

    try {
        const ticketCollectionRef = collection(db, 'tickets');
        const eventRef = doc(db, 'events', cartId);
        const eventSnapshot = await getDoc(eventRef);
        const eventData = eventSnapshot.data() as {
            name: string;
            bannerUrl: string;
            address: {
                street: string;
                number: number;
                complement?: string;
                postalCode: string;
            };
            startDate: Timestamp;
            endDate: Timestamp;
            organizerId: DocumentReference;
        };
        const organizerSnapshot = await getDoc(eventData.organizerId);
        const organizerData = organizerSnapshot.data() as {
            name: string;
            contact: {
                email: string;
                phone: string;
                whatsapp: string;
            };
        };

        const { batches, couponId, reservationDate } = await getCartById(
            session.user.id,
            cartId
        );

        let totalPrice = batches.reduce(
            (acc, batch) => acc + batch.price * batch.selectedAmount,
            0
        );

        let couponData: {
            isActive: boolean;
            discount: number;
            type: 'percent' | 'fixed';
        } | null = null;

        if (couponId) {
            const couponDoc = doc(db, 'events', cartId, 'coupons', couponId);

            const couponSnapshot = await getDoc(couponDoc);

            if (couponSnapshot.exists()) {
                couponData = couponSnapshot.data() as {
                    code: string;
                    isActive: boolean;
                    discount: number;
                    type: 'percent' | 'fixed';
                };
                if (couponData.isActive) {
                    if (couponData.type === 'percent') {
                        totalPrice *= 1 - couponData.discount / 100;
                    } else {
                        totalPrice -= couponData.discount;
                    }
                    if (totalPrice < 0) {
                        totalPrice = 0;
                    }
                }
                totalPrice = round(totalPrice);
            }
        }

        const ticketsDoc = new Array<DocumentReference>();
        const batchesNameByTicket: {
            [ticketId: string]: string;
        } = {};
        for (const batch of batches) {
            const batchRef = doc(db, 'events', cartId, 'batches', batch.id);

            let ticketPrice = batch.price;

            if (couponData && ticketPrice > 0) {
                if (couponData.isActive) {
                    if (couponData.type === 'percent') {
                        ticketPrice *= 1 - couponData.discount / 100;
                    }
                }
            }
            ticketPrice = round(ticketPrice);

            for (let i = 0; i < batch.selectedAmount; i++) {
                const ticketRef = await addDoc(ticketCollectionRef, {
                    batchId: batchRef,
                    batch: {
                        name: batch.name,
                        description: batch.description,
                        price: batch.price,
                    },
                    eventId: eventRef,
                    event: {
                        name: eventData.name,
                        bannerUrl: eventData.bannerUrl,
                        address: eventData.address,
                        startDate: eventData.startDate.toMillis(),
                        endDate: eventData.endDate.toMillis(),
                    },
                    userId: doc(db, 'users', session.user.id),
                    user: {
                        name: session.user.name,
                        email: session.user.email,
                        cpf: session.user.cpf ?? null,
                        phone: session.user.phone ?? null,
                    },
                    organizerId: eventData.organizerId,
                    organizer: {
                        name: organizerData.name,
                        contact: organizerData.contact,
                    },
                    status: ticketPrice > 0 ? 'PENDING_PAYMENT' : 'PAID',
                    price: ticketPrice,
                    dateReserved: new Date(reservationDate),
                    dateAcquired: ticketPrice > 0 ? null : new Date(),
                    paymentId: null,
                    couponId: couponId ?? null,
                });
                batchesNameByTicket[ticketRef.id] = batch.name;

                const data = `1001Ingressos://ticket.validate/${ticketRef.id}`;

                const options: Options = {
                    width: 300,
                    height: 300,
                    data,
                    image: 'https://firebasestorage.googleapis.com/v0/b/ticket-king-6be25.appspot.com/o/ticket_king.png?alt=media&token=42636a31-b042-45ca-82f4-959c87aef4a5',
                    margin: 0,
                    qrOptions: {
                        typeNumber: 0,
                        mode: 'Byte',
                        errorCorrectionLevel: 'Q',
                    },
                    imageOptions: {
                        hideBackgroundDots: true,
                        imageSize: 0.4,
                        margin: 0,
                    },
                    dotsOptions: { type: 'extra-rounded', color: '#6b6b6b' },
                    backgroundOptions: { color: '#ffffff' },
                    cornersSquareOptions: {
                        type: 'extra-rounded',
                        color: '#000000',
                    },
                    cornersDotOptions: { type: 'dot', color: '#000000' },
                };

                const qrCode = new QRCodeCanvas(options);

                const qrCodeData = await qrCode.toDataUrl('image/png');

                await updateDoc(ticketRef, {
                    qrCode: qrCodeData,
                });

                ticketsDoc.push(ticketRef);
            }
        }

        if (totalPrice > 0) {
            const payment = await paymentGateway.createPayment({
                value: totalPrice,
                dueDate: new Date(),
                ...cardData,
                remoteIp,
                customer,
            });

            // set all undefined keys to null
            for (const key in payment) {
                const parsedKey = key as keyof typeof payment;
                if (payment[parsedKey] === undefined) {
                    // @ts-ignore
                    payment[parsedKey] = null;
                }
            }
            console.log(payment);

            const paymentsRef = collection(db, 'payments');

            const paymentRef = await addDoc(paymentsRef, {
                ...payment,
                ticketsId: ticketsDoc,
                eventId: eventRef,
                userId: doc(db, 'users', session.user.id),
                couponId: couponId ?? null,
            });

            for (const ticketDoc of ticketsDoc) {
                await updateDoc(ticketDoc, {
                    paymentId: paymentRef,
                    payment: {
                        method: payment.method,
                        gateway: {
                            name: payment.gateway.name,
                            paymentId: payment.gateway.paymentId,
                            customerId: payment.gateway.customerId,
                        },
                        baseAmount: payment.baseAmount,
                        status: payment.status,
                    },
                });
            }

            const paymentSnapshot = await getDoc(paymentRef);

            const {
                dateCreated,
                dateApproved,
                transactionAmount,
                eventId,
                userId,
                ticketsId,
                ...paymentData
            } = paymentSnapshot.data() as {
                eventId: DocumentReference;
                userId: DocumentReference;
                ticketsId: DocumentReference[];
                method: { code: string; type: 'CREDIT_CARD' | 'PIX' };
                gateway: {
                    name: string;
                    paymentId: string;
                    customerId: string;
                    transactionData?: any;
                };
                baseAmount: number;
                transactionAmount: number;
                status: string;
                dateCreated: string;
                dateApproved: string;
            };

            const ticketStatus = parseTicketStatus(payment.status);

            for (const ticketDoc of ticketsDoc) {
                const ticketSnapshot = await getDoc(ticketDoc);

                /* if (!ticketSnapshot.exists()) {
                    throw new Error('Ticket not found');
                } */

                const ticketData = ticketSnapshot.data() as {
                    batchId: DocumentReference;
                    eventId: DocumentReference;
                    userId: DocumentReference;
                    status: 'PENDING_PAYMENT';
                    price: number;
                    dateReserved: Timestamp;
                    dateAcquired: Timestamp | null;
                    paymentId: DocumentReference | null;
                    qrCode: string;
                };

                updateDoc(ticketDoc, {
                    status: ticketStatus,
                    dateAcquired:
                        ticketStatus !== 'INVALIDATED'
                            ? payment.dateApproved ?? null
                            : null,
                });
                if (ticketStatus === 'INVALIDATED') {
                    updateDoc(ticketData.batchId, {
                        availableAmount: increment(1),
                    });
                }

                if (ticketStatus === 'PAID') {
                    await sendMail(session.user.email, {
                        qrCode: ticketData.qrCode,
                        eventBannerUrl: eventData.bannerUrl,
                        eventName: eventData.name,
                        name: session.user.name,
                        eventPlace: organizerData.name,
                        ticketBatch: batchesNameByTicket[ticketDoc.id],
                        ticketCode: ticketDoc.id,
                        eventDateRaw: eventData.startDate.toDate(),
                        ticketUrl: `https://1001ingressos.com.br/ticket/${ticketDoc.id}`,
                    });
                }
            }

            await updateCartPayment(session.user.id, cartId, paymentRef.id);

            return res.status(200).send({
                ...paymentData,
                id: paymentRef.id,
                dateApproved: new Date(dateApproved),
                dateCreated: new Date(dateCreated),
            });
        }

        const paymentsRef = collection(db, 'payments');
        const payment = {
            method: { code: 'FREE', type: 'FREE' },
            gateway: {
                name: 'FREE',
                paymentId: 'FREE',
                customerId: 'FREE',
            },
            baseAmount: 0,
            transactionAmount: 0,
            status: 'APPROVED',
            moneyReleaseDate: new Date(),
            dateCreated: new Date(),
            dateApproved: new Date(),
        };

        const paymentRef = await addDoc(paymentsRef, {
            ...payment,
            ticketsId: ticketsDoc,
            eventId: eventRef,
            userId: doc(db, 'users', session.user.id),
            couponId: couponId ?? null,
        });

        await updateCartPayment(session.user.id, cartId, null);

        for (const ticketDoc of ticketsDoc) {
            const ticketSnapshot = await getDoc(ticketDoc);

            const ticketData = ticketSnapshot.data() as {
                batchId: DocumentReference;
                eventId: DocumentReference;
                userId: DocumentReference;
                status: 'PAID';
                price: number;
                dateReserved: Timestamp;
                dateAcquired: Timestamp | null;
                paymentId: DocumentReference | null;
                qrCode: string;
            };
            await updateDoc(ticketDoc, {
                paymentId: paymentRef,
                payment: {
                    method: payment.method,
                    gateway: {
                        name: payment.gateway.name,
                        paymentId: payment.gateway.paymentId,
                        customerId: payment.gateway.customerId,
                    },
                    baseAmount: payment.baseAmount,
                    status: payment.status,
                },
            });
            await sendMail(session.user.email, {
                qrCode: ticketData.qrCode,
                eventBannerUrl: eventData.bannerUrl,
                eventName: eventData.name,
                name: session.user.name,
                eventPlace: organizerData.name,
                ticketBatch: batchesNameByTicket[ticketDoc.id],
                ticketCode: ticketDoc.id,
                eventDateRaw: eventData.startDate.toDate(),
                ticketUrl: `https://1001ingressos.com.br/ticket/${ticketDoc.id}`,
            });
        }

        res.status(200).send({
            id: 'free',
            status: 'APPROVED',
            dateApproved: new Date(),
            baseAmount: 0,
        });
    } catch (err) {
        const error = ensureError(err);
        if (error instanceof PaymentError) {
            console.error(error.message, error.stack);

            res.status(error.statusCode).send({
                error: error.type,
                message: error.message,
            });
            return;
        }
        res.status(500).send({
            error: 'unknown_payment_error',
            message: 'Não foi possível processar o pagamento',
        });
    }
};

export default handler;
