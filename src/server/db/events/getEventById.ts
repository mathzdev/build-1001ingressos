import { db } from '@/lib/firebaseClient';
import { round } from '@/utils/number';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { BatchData, EventData, OrganizerData } from './types';

export async function getEventById(id: string) {
    const eventRef = doc(db, 'events', id);

    const eventSnapshot = await getDoc(eventRef);

    if (!eventSnapshot.exists()) {
        throw new Error('Event not found');
    }

    const { organizerId, startDate, endDate, ...eventDataRaw } =
        eventSnapshot.data() as EventData;

    const batchesQuery = query(collection(eventRef, 'batches'));

    const batchesSnapshot = await getDocs(batchesQuery);

    const batchesData = batchesSnapshot.docs.map((doc) => {
        const data = doc.data();
        const price = round(data.price * 1.12);
        return {
            ...data,
            id: doc.id,
            price,
            startDate: data.startDate.toMillis(),
            endDate: data.endDate.toMillis(),
            parentBatch: data.parentBatch?.id ?? null,
        };
    }) as BatchData[];

    const eventData = {
        ...eventDataRaw,
        id: eventRef.id,
        startDateTimestamp: startDate.toMillis(),
        endDateTimestamp: endDate.toMillis(),
        batches: batchesData,
    };

    const organizerSnapshot = await getDoc(organizerId);

    if (!organizerSnapshot.exists()) {
        throw new Error('Organizer not found');
    }

    const organizerRaw = organizerSnapshot.data() as OrganizerData;
    const organizerData = {
        ...organizerRaw,
        id: organizerSnapshot.id,
    };

    return {
        eventData,
        organizerData,
    };
}
