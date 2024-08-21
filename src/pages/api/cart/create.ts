import { db } from '@/lib/firebaseClient';
import { NextApiRequest, NextApiResponse } from 'next';

import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { BatchData } from '@/server/db/events/types';
import {
    Timestamp,
    deleteDoc,
    doc,
    getDoc,
    increment,
    setDoc,
    writeBatch,
} from 'firebase/firestore';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

class CartCreateError extends Error {
    type:
        | 'batch_not_found'
        | 'batch_sold_out'
        | 'batch_max_amount_exceeded'
        | 'batch_not_enough_tickets_left';
    statusCode: number;

    constructor(
        message: string,
        type:
            | 'batch_not_found'
            | 'batch_sold_out'
            | 'batch_max_amount_exceeded'
            | 'batch_not_enough_tickets_left',
        statusCode: number = 400
    ) {
        super(message);
        this.name = 'CartCreateError';
        this.type = type;
        this.statusCode = statusCode;
    }
}

const schema = z.object({
    selectedTickets: z.record(z.string().min(1), z.number()),
    eventId: z.string(),
    couponId: z.string().optional(),
});

async function returnTicketsToBatch(
    eventId: string,
    selectedTickets: Record<string, number>
) {
    const batch = writeBatch(db);

    for (const batchId in selectedTickets) {
        const batchRef = doc(db, 'events', eventId, 'batches', batchId);
        const amount = selectedTickets[batchId];

        // Instead of a transaction, we use the batch to queue up the updates
        batch.update(batchRef, {
            availableAmount: increment(amount),
        });
    }

    // Commit the batch outside of the loop
    await batch.commit();
}

async function processTickets(
    eventId: string,
    selectedTickets: Record<string, number>
) {
    const batch = writeBatch(db);

    console.log(`Processing tickets for event ${eventId}`);

    for (const batchId in selectedTickets) {
        const batchRef = doc(db, 'events', eventId, 'batches', batchId);
        const batchSnapshot = await getDoc(batchRef);
        const batchData = batchSnapshot.data() as BatchData;
        const amount = selectedTickets[batchId];

        if (batchData.availableAmount <= 0) {
            throw new CartCreateError(
                'Batch is sold out',
                'batch_sold_out',
                400
            );
        } else if (batchData.availableAmount < amount) {
            throw new CartCreateError(
                'Not enough tickets left',
                'batch_not_enough_tickets_left',
                400
            );
        }

        const batchAmount = batchData.availableAmount - amount;

        if (batchAmount < 0) {
            throw new CartCreateError(
                'Max amount exceeded',
                'batch_max_amount_exceeded',
                400
            );
        }

        // Queue the update in the batch
        batch.update(batchRef, {
            availableAmount: increment(-amount),
        });
    }

    // Commit the batch outside of the loop
    await batch.commit();
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

    const parseResponse = schema.safeParse(req.body);

    if (!parseResponse.success) {
        res.status(400).json({
            error: 'invalid_request',
            message: parseResponse.error.message,
        });
        return;
    }

    const { selectedTickets, eventId, couponId } = parseResponse.data;

    try {
        const cartRef = doc(db, `users/${session.user.id}/carts/${eventId}`);

        const cartSnapshot = await getDoc(cartRef);

        if (cartSnapshot.exists()) {
            const cartData = cartSnapshot.data() as {
                couponId: string | null;
                paymentDate: Timestamp | null;
                reservationDate: Timestamp;
                selectedBatches: Record<string, number>;
            };
            if (!cartData.paymentDate) {
                console.log(
                    `Returning Cart\'s [${cartRef.id}] tickets to batch`
                );

                await returnTicketsToBatch(eventId, cartData.selectedBatches);
            } else {
                const cartArchiveRef = doc(
                    db,
                    'users',
                    session.user.id,
                    'cartsArchive',
                    `${cartRef.id}-${cartData.paymentDate.toMillis()}`
                );

                await setDoc(cartArchiveRef, cartData);

                // Delete cart
                await deleteDoc(cartRef);
            }
        }

        await processTickets(eventId, selectedTickets);

        await setDoc(cartRef, {
            reservationDate: new Date(),
            couponId: couponId || null,
            selectedBatches: selectedTickets,
        });

        res.status(200).json({
            cartId: cartRef.id,
        });
    } catch (error) {
        await returnTicketsToBatch(eventId, selectedTickets);

        const cartRef = doc(db, `users/${session.user.id}/carts/${eventId}`);
        await deleteDoc(cartRef);

        if (error instanceof CartCreateError) {
            res.status(error.statusCode).json({
                error: error.type,
                message: error.message,
            });
        } else {
            console.error(error);
            res.status(500).json({
                error: 'internal_server_error',
                message: 'Internal server error',
            });
        }
    }
};

export default handler;
