import { Timestamp } from 'firebase/firestore';

export interface CartData {
    couponId: string | null;
    paymentDate: Timestamp | null;
    paymentId: string | null;
    reservationDate: Timestamp;
    selectedBatches: Record<string, number>;
}
