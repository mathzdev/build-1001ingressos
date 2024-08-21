import { NextApiRequest, NextApiResponse } from 'next';

import { getCouponByCode } from '@/server/db/coupons/getCouponByCode';
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

const bodySchema = z.object({
    couponCode: z.string(),
    eventId: z.string(),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'method_not_allowed',
            message: 'Method not allowed',
        });
    }

    const parseResponse = bodySchema.safeParse(req.body);

    if (!parseResponse.success) {
        res.status(400).json({
            error: 'invalid_request',
            message: parseResponse.error.message,
        });
        return;
    }

    const { couponCode, eventId } = parseResponse.data;

    try {
        const couponData = await getCouponByCode(eventId, couponCode);
        res.status(200).json({
            ...couponData,
            couponCode,
        });
    } catch (error) {
        res.status(404).json({
            error: 'coupon_not_found',
            message: 'Coupon not found',
        });
        return;
    }
};

export default handler;
