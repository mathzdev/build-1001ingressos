import { deleteCouponByCode } from '@/server/db/coupons/deleteCouponByCode';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'DELETE') {
        try {
            const { eventId, couponCode } = req.query;

            if (typeof eventId === 'string' && typeof couponCode === 'string') {
                await deleteCouponByCode(eventId, couponCode);
                return res
                    .status(200)
                    .json({ message: 'Coupon deleted successfully' });
            } else {
                return res.status(400).json({ error: 'Invalid parameters' });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', 'DELETE');
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
