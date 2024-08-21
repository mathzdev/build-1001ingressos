import { db } from '@/lib/firebaseClient';
import { PaymentData } from '@/pages/evento/[slug]/carrinho/[cartId]';
import { round } from '@/utils/number';
import { Timestamp, doc, getDoc } from 'firebase/firestore';
import { BatchData } from '../events/types';
import { CartData } from './types';

export async function getCartById(userId: string, cartId: string) {
    const cartRef = doc(db, 'users', userId, 'carts', cartId);

    const cartSnapshot = await getDoc(cartRef);

    if (!cartSnapshot.exists()) {
        throw new Error('Cart not found');
    }

    const {
        couponId,
        reservationDate,
        selectedBatches,
        paymentId,
        paymentDate,
    } = cartSnapshot.data() as CartData;

    const eventRef = doc(db, 'events', cartId);
    const eventSnapshot = await getDoc(eventRef);
    const { slug } = eventSnapshot.data() as {
        slug: string;
    };

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
            parentBatch: batchData.parentBatch?.id ?? null,
        } as BatchData & { selectedAmount: number });
    }

    let payment: PaymentData | null = null;

    if (paymentId) {
        const paymentRef = doc(db, 'payments', paymentId);
        const paymentSnapshot = await getDoc(paymentRef);

        if (!paymentSnapshot.exists()) {
            throw new Error('Payment not found');
        }

        const { dateApproved, dateCreated, ...paymentData } =
            paymentSnapshot.data() as Omit<
                PaymentData,
                'id' | 'dateApproved' | 'dateCreated'
            > & {
                dateApproved: Timestamp | null;
                dateCreated: Timestamp;
            };

        payment = {
            ...paymentData,
            id: paymentSnapshot.id,
            dateApproved: dateApproved
                ? dateApproved.toDate().toISOString()
                : null,
            dateCreated: dateCreated.toDate().toISOString(),
        };
    }

    return {
        slug,
        couponId,
        reservationDate: reservationDate.toDate().toISOString(),
        batches,
        payment,
    };
}
