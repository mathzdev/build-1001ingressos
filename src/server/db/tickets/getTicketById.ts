import { db } from '@/lib/firebaseClient';
import { Timestamp, doc, getDoc } from 'firebase/firestore';
import { BatchData, EventData } from '../events/types';
import { UserData } from '../users/types';
import { TicketData } from './types';

export async function getTicketById(id: string) {
    const ticketRef = doc(db, 'tickets', id);
    const ticketSnapshot = await getDoc(ticketRef);

    if (!ticketSnapshot.exists()) {
        throw new Error("Ticket doesn't exist");
    }

    const { userId, eventId, batchId, organizerId, paymentId, ...ticketData } =
        ticketSnapshot.data() as TicketData;

    const [batchSnapshot, eventSnapshot, userSnapshot] = await Promise.all([
        getDoc(batchId),
        getDoc(eventId),
        getDoc(userId),
    ]);

    const batchData = batchSnapshot.data() as Omit<
        BatchData,
        'startDate' | 'endDate'
    > & { startDate: Timestamp; endDate: Timestamp };
    const { organizerId: eventOrganizerId, ...eventData } =
        eventSnapshot.data() as EventData;
    const { password, ...userData } = userSnapshot.data() as UserData;

    return {
        ticket: { ...ticketData, id: ticketSnapshot.id },
        batch: { ...batchData, id: batchSnapshot.id },
        event: {
            ...eventData,
            id: eventSnapshot.id,
            organizerId: eventOrganizerId.id,
        },
        user: { ...userData, id: userSnapshot.id },
    };
}
