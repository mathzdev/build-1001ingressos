import { db } from '@/lib/firebaseClient';
import { addDoc, collection, doc } from 'firebase/firestore';
import { BatchDTO } from './types';

export async function createBatch(eventId: string, data: BatchDTO) {
    const batchCollectionRef = collection(db, 'events', eventId, 'batches');

    const batchRef = await addDoc(batchCollectionRef, {
        ...data,
        parentBatch: data.parentBatch
            ? doc(batchCollectionRef, data.parentBatch)
            : null,
    });

    return batchRef.id;
}
