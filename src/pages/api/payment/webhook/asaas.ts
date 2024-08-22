import { sendMail } from '@/lib/email/mailSender';
import { firestoreAdmin } from '@/lib/firebase';
import paymentGateways from '@/server/paymentGateways';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';
import { NextApiRequest, NextApiResponse } from 'next';
import { parseTicketStatus } from '..';

type WebhookEvent =
    | 'PAYMENT_CREATED'
    | 'PAYMENT_AWAITING_RISK_ANALYSIS'
    | 'PAYMENT_APPROVED_BY_RISK_ANALYSIS'
    | 'PAYMENT_REPROVED_BY_RISK_ANALYSIS'
    | 'PAYMENT_UPDATED'
    | 'PAYMENT_CONFIRMED'
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_ANTICIPATED'
    | 'PAYMENT_OVERDUE'
    | 'PAYMENT_DELETED'
    | 'PAYMENT_RESTORED'
    | 'PAYMENT_REFUNDED'
    | 'PAYMENT_REFUND_IN_PROGRESS'
    | 'PAYMENT_RECEIVED_IN_CASH_UNDONE'
    | 'PAYMENT_CHARGEBACK_REQUESTED'
    | 'PAYMENT_CHARGEBACK_DISPUTE'
    | 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL'
    | 'PAYMENT_DUNNING_RECEIVED'
    | 'PAYMENT_DUNNING_REQUESTED'
    | 'PAYMENT_BANK_SLIP_VIEWED'
    | 'PAYMENT_CHECKOUT_VIEWED';

export interface AsaasWebhookResponse {
    event: WebhookEvent;
    payment: {
        object: string;
        id: string;
        dateCreated: Date;
        customer: string;
        subscription: string;
        installment: string;
        paymentLink: string;
        dueDate: Date;
        originalDueDate: Date;
        value: number;
        netValue: number;
        originalValue: null;
        interestValue: null;
        nossoNumero: null;
        description: string;
        externalReference: string;
        billingType: string;
        status: string;
        pixTransaction: null;
        confirmedDate: Date;
        paymentDate: Date;
        clientPaymentDate: Date;
        installmentNumber: null;
        creditDate: Date;
        custody: null;
        estimatedCreditDate: Date;
        invoiceUrl: string;
        bankSlipUrl: null;
        transactionReceiptUrl: string;
        invoiceNumber: string;
        deleted: boolean;
        anticipated: boolean;
        anticipable: boolean;
        lastInvoiceViewedDate: Date;
        lastBankSlipViewedDate: null;
        postalService: boolean;
        creditCard: CreditCard;
        discount: Discount;
        fine: Fine;
        interest: Fine;
        split: Split[];
        chargeback: Chargeback;
        refunds: null;
    };
}

export interface Chargeback {
    status: string;
    reason: string;
}

export interface CreditCard {
    creditCardNumber: string;
    creditCardBrand: string;
    creditCardToken: string;
}

export interface Discount {
    value: number;
    dueDateLimitDays: number;
    limitedDate: null;
    type: string;
}

export interface Fine {
    value: number;
    type: string;
}

export interface Split {
    walletId: string;
    fixedValue?: number;
    status: string;
    refusalReason: null;
    percentualValue?: number;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(200).send('Method not allowed');
    }

    const asaasClient = paymentGateways.CREDIT_CARD;

    const { event, payment } = req.body as AsaasWebhookResponse;
    console.log(`Webhook Asaas (${event}): Payment ${payment.id}`);

    try {
        const {
            status,
            dateApproved,
            transactionAmount,
            moneyReleaseDate,
            gateway,
        } = await asaasClient.getPayment(payment.id);

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

            res.status(200).json({
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

            res.status(200).json({
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

            res.status(200).json({
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
                        const [eventSnapshot, userSnapshot] = await Promise.all(
                            [ticketData.eventId.get(), ticketData.userId.get()]
                        );

                        const eventData = eventSnapshot.data() as {
                            name: string;
                            startDate: Timestamp;
                            bannerUrl: string;
                            organizerId: DocumentReference;
                        };

                        const organizerSnapshot =
                            await eventData.organizerId.get();
                        const organizerData = organizerSnapshot.data() as {
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
                            ticketUrl: `https://1001ingressos.com.br/ticket/${ticketSnapshot.id}`,
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
        console.log(error);
        res.status(500).json({
            error: 'unknown_error',
            message: 'Não foi possível processar o pagamento',
        });
        return;
    }
}
