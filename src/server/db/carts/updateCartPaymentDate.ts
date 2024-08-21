import { db } from '@/lib/firebaseClient';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function updateCartPayment(
    userId: string,
    cartId: string,
    paymentId: string | null
) {
    const cartRef = doc(db, 'users', userId, 'carts', cartId);

    const cartSnapshot = await getDoc(cartRef);

    if (!cartSnapshot.exists()) {
        throw new Error('Cart not found');
    }

    const paymentDate = new Date();

    await updateDoc(cartRef, {
        paymentDate,
        paymentId,
    });

    return {
        paymentDate,
        paymentId,
    };
}
