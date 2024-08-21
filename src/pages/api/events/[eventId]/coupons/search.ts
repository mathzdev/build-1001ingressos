import { searchCouponsByEventId } from '@/server/db/coupons/searchCouponsByEventId';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { eventId } = req.query;
    const searchQuery = req.query.query || ('' as string);

    console.log('QUERY', searchQuery);

    try {
        const { coupons } = await searchCouponsByEventId(
            eventId as string,
            searchQuery as string
        );
        res.status(200).json({ coupons });
    } catch (error) {
        console.error('Error on coupon search:', error);
        res.status(500).json({ message: 'Error on coupon search' });
    }
}
