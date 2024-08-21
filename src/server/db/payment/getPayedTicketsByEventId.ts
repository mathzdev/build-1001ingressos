import {
    DocumentReference,
    Firestore,
    Timestamp,
    collection,
    doc,
    getDocs,
    query,
    where,
} from 'firebase/firestore';

interface PaymentResponse {
    id: string;
}

interface PaymentSummary {
    date: number;
    dateFormatted: string;
    amount: number;
}

interface PaymentData {
    userId: DocumentReference;
    status: string;
    dateCreated: Timestamp;
    dateApproved: Timestamp | null;
    fees: {
        amount: number;
        type: string;
    };
    moneyReleasedDate: string;
    method: {
        id: string;
        type: string;
    };
    transactionAmount: number;

    baseAmount: number;
    ticketsId: DocumentReference[];
    eventId: DocumentReference;
    gateway: string;
    gatewayId: string;
}

type PaymentDTO = Omit<
    PaymentData,
    'eventId' | 'ticketsId' | 'userId' | 'dateApproved' | 'dateCreated'
> & {
    dateApproved: number | null;
    dateCreated: number;
};

export async function getPayedTicketsByEventId(
    db: Firestore,
    eventId: string
): Promise<Number> {
    let soldTicketsCount = 0;

    const paymentsQuery = query(
        collection(db, 'payments'),
        where('eventId', '==', doc(db, 'events', eventId))
    );

    const querySnapshot = await getDocs(paymentsQuery);

    querySnapshot.forEach((doc) => {
        const {
            eventId,
            ticketsId,
            userId,
            dateCreated,
            dateApproved,
            ...paymentData
        } = doc.data() as PaymentData;

        if (
            paymentData.status === 'APPROVED' ||
            paymentData.status === 'AUTHORIZED'
        ) {
            soldTicketsCount++;
        }
    });
    return soldTicketsCount;
}
