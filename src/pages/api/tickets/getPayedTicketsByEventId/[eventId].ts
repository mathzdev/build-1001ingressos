import { db } from '@/lib/firebaseClient';
import { getPayedTicketsByEventId } from '@/server/db/payment/getPayedTicketsByEventId';

export default async function handler(req: any, res: any) {
    const { eventId } = req.query;

    console.log('EVENT ID: ' + eventId);

    try {
        const soldTicketsCount = await getPayedTicketsByEventId(db, eventId);
        res.status(200).json({ soldTicketsCount });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar ingressos vendidos' });
    }
}
