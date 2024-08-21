import { db } from '@/lib/firebaseClient';
import { NextApiRequest, NextApiResponse } from 'next';

import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

class CartDeleteError extends Error {
    type: 'cart_not_found';
    statusCode: number;

    constructor(
        message: string,
        type: 'cart_not_found',
        statusCode: number = 404
    ) {
        super(message);
        this.name = 'CartDeleteError';
        this.type = type;
        this.statusCode = statusCode;
    }
}

const schema = z.object({
    cartId: z.string(),
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

    const { cartId } = parseResponse.data;

    try {
        const cartRef = doc(db, `users/${session.user.id}/carts/${cartId}`);
        const cartSnapshot = await getDoc(cartRef);

        if (!cartSnapshot.exists()) {
            throw new CartDeleteError('Cart not found', 'cart_not_found');
        }
        await deleteDoc(cartRef);
    } catch (error) {
        if (error instanceof CartDeleteError) {
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
