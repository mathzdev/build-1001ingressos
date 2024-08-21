import { db } from '@/lib/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';

export async function searchCouponsByEventId(
    eventId: string,
    couponCode: string
) {
    const couponRef = doc(db, 'events', eventId, 'coupons', couponCode);

    const docSnapshot = await getDoc(couponRef);

    const coupons = [];
    if (docSnapshot.exists()) {
        coupons.push({
            couponCode: docSnapshot.id,
            ...docSnapshot.data(),
        });
    }

    return { coupons };
}
