import { sendMail } from '@/lib/email/mailSender';
import { firestoreAdmin } from '@/lib/firebase';
import paymentGateways from '@/server/paymentGateways';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';
import { NextApiRequest, NextApiResponse } from 'next';
import { parseTicketStatus } from '..';

export interface MercadoPagoWebhookResponse {
    action: string;
    api_version: string;
    application_id: string;
    date_created: string;
    id: string;
    live_mode: string;
    type: string;
    user_id: number;
    data: {
        id: string;
    };
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    const mercadoPagoClient = paymentGateways.PIX;

    const {
        id: webhookId,
        type,
        data,
    } = req.body as MercadoPagoWebhookResponse;
    console.log(
        `Webhook MercadoPago (${webhookId}) - ${type}: Payment ${data.id}`
    );

    switch (type) {
        case 'payment':
            try {
                const {
                    status,
                    dateApproved,
                    transactionAmount,
                    moneyReleaseDate,
                    gateway,
                } = await mercadoPagoClient.getPayment(data.id);

                const paymentsSnapshot = await firestoreAdmin
                    .collection('payments')
                    .where('gateway.paymentId', '==', gateway.paymentId)
                    .limit(1)
                    .get();

                if (paymentsSnapshot.empty) {
                    console.error({
                        error: 'payment_not_found',
                        message: 'Pagamento não encontrado',
                    });

                    res.status(404).json({
                        error: 'payment_not_found',
                        message: 'Pagamento não encontrado',
                    });
                    return;
                }
                console.log(paymentsSnapshot.docs[0]);

                const ticketStatus = parseTicketStatus(status);

                if (!paymentsSnapshot.docs[0].exists) {
                    console.error({
                        error: 'payment_not_found',
                        message: 'Pagamento não encontrado',
                    });

                    res.status(404).json({
                        error: 'payment_not_found',
                        message: 'Pagamento não encontrado',
                    });
                    return;
                }

                const batch = firestoreAdmin.batch();
                const paymentRef = paymentsSnapshot.docs[0].ref;

                batch.update(paymentRef, {
                    status,
                    dateApproved: dateApproved ?? null,
                    transactionAmount,
                    moneyReleaseDate: moneyReleaseDate ?? null,
                });

                const ticketsSnapshot = await firestoreAdmin
                    .collection('tickets')
                    .where('paymentId', '==', paymentRef)
                    .get();

                if (ticketsSnapshot.empty) {
                    console.error({
                        error: 'ticket_not_found',
                        message: 'Ingresso não encontrado',
                    });

                    res.status(404).json({
                        error: 'ticket_not_found',
                        message: 'Ingresso não encontrado',
                    });
                    return;
                }

                for (const ticketSnapshot of ticketsSnapshot.docs) {
                    const ticketData = ticketSnapshot.data() as {
                        batchId: DocumentReference;
                        eventId: DocumentReference;
                        userId: DocumentReference;
                        status: string;
                        price: number;
                        dateReserved: Timestamp;
                        dateAcquired: Timestamp | null;
                        paymentId: DocumentReference | null;
                        qrCode: string;
                    };
                    const batchSnapshot = await ticketData.batchId.get();

                    const batchData = batchSnapshot.data() as {
                        name: string;
                        availableAmount: number;
                    };

                    if (ticketStatus !== 'INVALIDATED') {
                        batch.update(ticketSnapshot.ref, {
                            status: ticketStatus,
                            dateAcquired: dateApproved ?? null,
                            paymentId: paymentRef,
                            payment: {
                                status,
                            },
                        });
                        try {
                            if (
                                ticketStatus === 'PAID' &&
                                ticketData.status !== 'PAID'
                            ) {
                                const [eventSnapshot, userSnapshot] =
                                    await Promise.all([
                                        ticketData.eventId.get(),
                                        ticketData.userId.get(),
                                    ]);

                                const eventData = eventSnapshot.data() as {
                                    name: string;
                                    startDate: Timestamp;
                                    bannerUrl: string;
                                    organizerId: DocumentReference;
                                };

                                const organizerSnapshot =
                                    await eventData.organizerId.get();
                                const organizerData =
                                    organizerSnapshot.data() as {
                                        name: string;
                                    };

                                const userData = userSnapshot.data() as {
                                    name: string;
                                    email: string;
                                };

                                await sendMail(userData.email, {
                                    qrCode: ticketData.qrCode,
                                    eventBannerUrl: eventData.bannerUrl,
                                    eventName: eventData.name,
                                    name: userData.name,
                                    eventPlace: organizerData.name,
                                    ticketBatch: batchData.name,
                                    ticketCode: ticketSnapshot.id,
                                    eventDateRaw: eventData.startDate.toDate(),
                                    ticketUrl: `https://ticketking.com.br/ticket/${ticketSnapshot.id}`,
                                });
                            }
                        } catch (error) {
                            console.error('Error sending email');

                            console.error(error);
                        }
                    } else {
                        batch.update(ticketSnapshot.ref, {
                            status: ticketStatus,
                            paymentId: paymentRef,
                            payment: {
                                status,
                            },
                        });

                        batch.update(ticketData.batchId, {
                            availableAmount: batchData.availableAmount + 1,
                        });
                    }
                }

                await batch.commit();

                res.status(200).json(gateway);
                return;
            } catch (error) {
                res.status(500).json({
                    error: 'unknown_error',
                    message: 'Não foi possível processar o pagamento',
                });
                return;
            }
        default:
            return res.status(200).send('ok');
    }
}
