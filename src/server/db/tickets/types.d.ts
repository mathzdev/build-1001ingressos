import { DocumentReference, Timestamp } from 'firebase/firestore';

export interface CartData {
    couponId: string | null;
    reservationDate: Timestamp;
    selectedBatches: Record<string, number>;
}

export type TicketStatus =
    | 'PAID'
    | 'PROCESSING_PAYMENT'
    | 'REFUNDED'
    | 'PENDING_PAYMENT'
    | 'INVALIDATED'
    | 'SCANNED';

export interface TicketData {
    batchId: DocumentReference;
    eventId: DocumentReference;
    organizerId: DocumentReference;
    paymentId: DocumentReference;
    userId: DocumentReference;
    status: TicketStatus;
    qrCode: string;
    dateAcquired: Timestamp;
    dateReserved: Timestamp;
    price: number;
    dateScanned: Timestamp | null;
    couponId?: string | null;
    scannedBy: {
        id: string;
        name: string;
    } | null;
}

export interface FreeTicketDTO {
    id: string;
    qrCode: string;
    batch: {
        name: string;
        description: string;
        price: number;
    };
    event: {
        name: string;
        bannerUrl: string;
        address: {
            street: string;
            number: string;
            postalCode: string;
            complement: string;
        };
        startDate: number;
        endDate: number;
    };
    user: {
        name: string;
        email: null;
        cpf: null;
        phone: null;
    };
    organizer: {
        name: string;
        contact: {
            email: string;
            phone: string;
            whatsapp: string;
            socialNetworks: {
                facebook: string;
                instagram: string;
            };
        };
    };
    status: 'PAID';
    price: number;
    paymentId: string;
}
