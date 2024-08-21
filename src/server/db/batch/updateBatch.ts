import { db } from '@/lib/firebaseClient';
import { doc, updateDoc } from 'firebase/firestore';
import { BatchDTO } from './types';

export async function updateBatch(
    eventId: string,
    batchId: string,
    data: BatchDTO
) {
    const batchRef = doc(db, 'events', eventId, 'batches', batchId);

    await updateDoc(batchRef, {
        ...data,
        parentBatch: data.parentBatch ? doc(batchRef, data.parentBatch) : null,
    });

    return batchRef.id;
}
