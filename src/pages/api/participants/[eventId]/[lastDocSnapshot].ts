import { getParticipants } from '@/server/db/participants/getParticipants';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { eventId, lastDocSnapshot } = req.query;
    try {
        console.log('last doc id', lastDocSnapshot);
        const { participants, lastVisible } = await getParticipants(
            eventId as string,
            lastDocSnapshot
        );
        res.status(200).json({ participants, lastVisible });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ message: 'Error fetching coupons' });
    }
}
