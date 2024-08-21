import { getAllCouponsByEventId } from '@/server/db/coupons/getAllCouponsByEventId';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { eventId, lastDocSnapshot } = req.query;
    try {
        const { coupons, lastVisible } = await getAllCouponsByEventId(
            eventId as string,
            lastDocSnapshot
        );
        res.status(200).json({ coupons, lastVisible });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ message: 'Error fetching coupons' });
    }
}
