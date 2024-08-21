import { db } from '@/lib/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';
import { CouponData } from './types';

export async function getCouponByCode(eventId: string, couponCode: string) {
    const couponRef = doc(
        db,
        'events',
        eventId,
        'coupons',
        couponCode.toLowerCase()
    );

    const couponSnapshot = await getDoc(couponRef);

    if (!couponSnapshot.exists()) {
        throw new Error('Coupon not found');
    }

    const couponData = couponSnapshot.data() as CouponData;

    return {
        ...couponData,
        couponCode,
    };
}
