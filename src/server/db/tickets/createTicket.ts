import { db } from '@/lib/firebaseClient';
import { round } from '@/utils/number';
import { doc, getDoc } from 'firebase/firestore';
import { BatchData } from '../events/types';
import { CartData } from './types';

export async function createTicket(userId: string, cartId: string) {
    const cartRef = doc(db, 'users', userId, 'carts', cartId);

    const cartSnapshot = await getDoc(cartRef);

    if (!cartSnapshot.exists()) {
        throw new Error('Cart not found');
    }

    const { couponId, reservationDate, selectedBatches } =
        cartSnapshot.data() as CartData;

    const batches = new Array<BatchData & { selectedAmount: number }>();

    for (const batchId in selectedBatches) {
        const batchRef = doc(db, 'events', cartId, 'batches', batchId);

        const batchSnapshot = await getDoc(batchRef);

        if (!batchSnapshot.exists()) {
            throw new Error('Batch not found');
        }

        const batchData = batchSnapshot.data();
        const price = round(batchData.price * 1.12);
        batches.push({
            ...batchData,
            id: batchSnapshot.id,
            price,
            startDate: batchData.startDate.toMillis(),
            endDate: batchData.endDate.toMillis(),
            selectedAmount: selectedBatches[batchId],
        } as BatchData & { selectedAmount: number });
    }

    return {
        couponId,
        reservationDate: reservationDate.toMillis(),
        batches,
    };
}
