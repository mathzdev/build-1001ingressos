import { firestoreAdmin } from '@/lib/firebase';
import { NextApiRequest, NextApiResponse } from 'next';

import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

class CheckoutInvalidateError extends Error {
    type:
        | 'ticket_not_found'
        | 'ticket_already_paid'
        | 'batch_not_found'
        | 'ticket_not_owned_by_user';
    statusCode: number;

    constructor(
        message: string,
        type:
            | 'ticket_not_found'
            | 'ticket_already_paid'
            | 'batch_not_found'
            | 'ticket_not_owned_by_user',
        statusCode: number = 400
    ) {
        super(message);
        this.name = 'CheckoutInvalidateError';
        this.type = type;
        this.statusCode = statusCode;
    }
}

const schema = z.object({
    ticketId: z.string(),
});

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

    const parseResponse = schema.safeParse(req.body);

    if (!parseResponse.success) {
        res.status(400).json({
            error: 'invalid_request',
            message: parseResponse.error.message,
        });
        return;
    }

    const { ticketId } = parseResponse.data;

    try {
        await firestoreAdmin.runTransaction(async (transaction) => {
            const ticketSnapshot = await transaction.get(
                firestoreAdmin.collection('tickets').doc(ticketId)
            );

            if (!ticketSnapshot.exists) {
                throw new CheckoutInvalidateError(
                    'Não foi possível encontrar o ingresso',
                    'ticket_not_found',
                    404
                );
            }

            const ticketData = ticketSnapshot.data();

            if (ticketData!.status === 'PAID') {
                throw new CheckoutInvalidateError(
                    'Não é possível invalidar um ingresso já pago',
                    'ticket_already_paid'
                );
            }

            if (ticketData!.userId !== session.user.id) {
                throw new CheckoutInvalidateError(
                    'O ingresso não pertence a você',
                    'ticket_not_owned_by_user',
                    403
                );
            }

            const batchSnapshot = await transaction.get(
                firestoreAdmin
                    .collection('events')
                    .doc(ticketData!.eventId)
                    .collection('batches')
                    .doc(ticketData!.batchId)
            );

            if (!batchSnapshot.exists) {
                throw new CheckoutInvalidateError(
                    'Não foi possível encontrar o lote',
                    'batch_not_found',
                    404
                );
            }

            const batchData = batchSnapshot.data();

            transaction.update(
                firestoreAdmin
                    .collection('events')
                    .doc(ticketData!.eventId)
                    .collection('batches')
                    .doc(ticketData!.batchId),
                {
                    availableAmount: batchData!.availableAmount + 1,
                }
            );

            transaction.delete(ticketSnapshot.ref);
        });

        res.status(200).json({
            message: 'Ingresso invalidado com sucesso',
        });
    } catch (error) {
        if (error instanceof CheckoutInvalidateError) {
            return res.status(error.statusCode).json({
                error: error.type,
                message: error.message,
            });
        }
        console.log(error);
        res.status(500).send({
            error: 'unknown_checkout_invalidate_error',
            message: 'Não foi possível invalidar o ingresso',
        });
    }
};

export default handler;
