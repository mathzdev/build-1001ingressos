import { db } from '@/lib/firebaseClient';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    startAfter,
} from 'firebase/firestore';

export async function getAllCouponsByEventId(eventId: string, lastDocId: any) {
    const couponsCollectionRef = collection(db, 'events', eventId, 'coupons');
    let couponsQuery = query(couponsCollectionRef, limit(10));

    if (lastDocId) {
        const lastDocRef = doc(db, 'events', eventId, 'coupons', lastDocId);
        const lastDocSnapshot = await getDoc(lastDocRef);
        if (lastDocSnapshot.exists()) {
            couponsQuery = query(
                couponsCollectionRef,
                startAfter(lastDocSnapshot),
                limit(10)
            );
        }
    }

    const querySnapshot = await getDocs(couponsQuery);

    const coupons = [] as any;
    let lastVisible = null;
    querySnapshot.forEach((docSnapshot) => {
        coupons.push({
            couponCode: docSnapshot.id,
            ...docSnapshot.data(),
        });
        lastVisible = docSnapshot;
    });

    return { coupons, lastVisible };
}
