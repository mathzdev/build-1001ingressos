import { db } from '@/lib/firebaseClient';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';

export async function getUsedCouponsByEventId(eventId: string) {
    const couponsCollectionRef = collection(db, 'events', eventId, 'coupons');
    const allCouponsSnapshot = await getDocs(couponsCollectionRef);

    const allCoupons = new Map();
    allCouponsSnapshot.forEach((docSnapshot) => {
        console.log(`Coupon found: ${docSnapshot.id}`);
        allCoupons.set(docSnapshot.id.toLowerCase(), {
            ...docSnapshot.data(),
            usedCount: 0,
        });
    });

    const ticketsCollectionRef = collection(db, 'tickets');
    const usedCouponsQuery = query(
        ticketsCollectionRef,
        where('eventId', '==', doc(db, 'events', eventId)),
        where('couponId', '!=', null)
    );

    const usedCouponsSnapshot = await getDocs(usedCouponsQuery);

    usedCouponsSnapshot.forEach((ticketDoc) => {
        const data = ticketDoc.data();
        const couponId = data.couponId;
        const dateAcquired = data.dateAcquired;
        console.log(`Ticket with couponId: ${couponId}`);
        if (
            couponId &&
            dateAcquired &&
            allCoupons.has(couponId.toLowerCase())
        ) {
            allCoupons.get(couponId.toLowerCase()).usedCount++;
        }
    });

    const usedCoupons = Array.from(allCoupons.entries())
        .filter(([name, coupon]) => coupon.usedCount > 0)
        .map(([name, coupon]) => ({
            name,
            isActive: coupon.isActive,
            type: coupon.type,
            discount: coupon.discount,
            usedCount: coupon.usedCount,
        }));

    return usedCoupons;
}
