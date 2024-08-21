import { db } from '@/lib/firebaseClient';
import { round } from '@/utils/number';
import {
    collection,
    getDoc,
    getDocs,
    limit,
    query,
    where,
} from 'firebase/firestore';
import { BatchData, EventData, OrganizerData } from './types';

export async function getEventBySlug(slug: string) {
    const eventsQuery = query(
        collection(db, 'events'),
        where('slug', '==', slug),
        limit(1)
    );
    const eventSnapshot = await getDocs(eventsQuery);

    if (eventSnapshot.empty) {
        throw new Error('Event not found');
    }

    const { organizerId, startDate, endDate, ...eventDataRaw } =
        eventSnapshot.docs[0].data() as EventData;

    const eventRef = eventSnapshot.docs[0].ref;

    const batchesQuery = query(
        collection(eventRef, 'batches'),
        where('isVisible', '==', true),
        where('availableAmount', '>', 0)
    );

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
