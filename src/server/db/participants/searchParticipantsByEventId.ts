import { db } from '@/lib/firebaseClient';
import {
    collection,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    where,
} from 'firebase/firestore';

export async function searchParticipantsByEventId(
    eventId: string,
    userEmail: string
) {
    let participantsQuery = query(
        collection(db, 'tickets'),
        where('eventId', '==', doc(db, 'events', eventId)),
        where('status', 'in', ['PAID', 'SCANNED']),
        where('user.email', '==', userEmail),
        orderBy('user.email'),
        limit(10)
    );

    const querySnapshot = await getDocs(participantsQuery);
    const participants = [] as any;

    querySnapshot.forEach((docSnapshot) => {
        const ticketData = docSnapshot.data();
        const paymentId =
            ticketData.paymentId && ticketData.paymentId.id
                ? ticketData.paymentId.id
                : 'Cortesia';
        const payerName = ticketData.user
            ? ticketData.user.name
            : 'Nome Indefinido';
        const payerEmail = ticketData.user
            ? ticketData.user.email
            : 'Email Indefinido';
        const batchName = ticketData.batch
            ? ticketData.batch.name
            : 'Lote Indefinido';

        participants.push({
            name: payerName,
            email: payerEmail,
            batchName: batchName,
            paymentId: paymentId,
        });
    });

    return { participants };
}
