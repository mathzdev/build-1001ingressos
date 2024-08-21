import { DocumentReference, Timestamp } from 'firebase/firestore';

export interface EventData {
    organizerId: DocumentReference;
    name: string;
    slug: string;
    startDate: Timestamp;
    endDate: Timestamp;
    address: {
        street: string;
        number: string;
        postalCode: string;
        complement: string;
    };
    description: string;
    batches: BatchData[];

    policy: string;
    bannerUrl: string;
    category: string;
    producer: {
        name: string;
        description: string;
    };
    isVisible: boolean;
}

export interface BatchData {
    id: string;
    name: string;
    gender: 'FEMININO' | 'MASCULINO' | 'UNISSEX';
    type: 'PUBLIC' | 'PRIVATE' | 'SECRET';
    price: number;
    availableAmount: number;
    startAmount: number;
    isVisible: boolean;
    startDate: number;
    endDate: number;
    minBuyAmount: number;
    maxBuyAmount: number;
    description: string;
    parentBatch: string | null;
}

export interface OrganizerData {
    id: string;
    address: {
        street: string;
        number: number;
        postalCode: number;
        complement: string;
    };
    contact: {
        email: string;
        phone: string;
        whatsapp: string;
        socialNetworks: {
            facebook: string;
            instagram: string;
        };
    };

    description: string;
    name: string;
    users: Record<string, boolean>;
}
