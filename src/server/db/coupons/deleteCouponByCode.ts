import { db } from '@/lib/firebaseClient';
import { deleteDoc, doc } from 'firebase/firestore';

export async function deleteCouponByCode(eventId: string, couponCode: string) {
    const couponRef = doc(
        db,
        'events',
        eventId,
        'coupons',
        couponCode.toLowerCase()
    );

    await deleteDoc(couponRef);
}
