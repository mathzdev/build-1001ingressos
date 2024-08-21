import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    where,
} from 'firebase/firestore';

import { db } from '@/lib/firebaseClient';
import { TicketData } from '../tickets/types';
import { UserData } from '../users/types';

export async function getParticipants(
    eventId: string,
    lastDocEmail: any = null
) {
    let participantsQuery = query(
        collection(db, 'tickets'),
        where('eventId', '==', doc(db, 'events', eventId)),
        where('status', 'in', ['PAID', 'SCANNED']),
        orderBy('user.email'),
        limit(10)
    );

    if (lastDocEmail) {
        const lastDocQuery = query(
            collection(db, 'tickets'),
            where('user.email', '==', lastDocEmail),
            limit(1)
        );

        const lastDocSnapshot = await getDocs(lastDocQuery);

        console.log(
            'ID do último documento para uso na paginação:',
            lastDocSnapshot.docs[0]
        );

        if (!lastDocSnapshot.empty) {
            // Usa o documento real como referência para startAfter.
            participantsQuery = query(
                participantsQuery,
                startAfter(lastDocSnapshot.docs[0]),
                limit(10)
            );
        }
    }

    const ticketsSnapshot = await getDocs(participantsQuery);
    const participants = [];
    let lastVisible = null;

    for (const ticketSnapshot of ticketsSnapshot.docs) {
        const { userId, paymentId, batchId } =
            ticketSnapshot.data() as TicketData;

        let payerName = '',
            payerEmail = '';
        if (userId) {
            const userDoc = await getDoc(userId);
            if (userDoc.exists()) {
                const userData = userDoc.data() as UserData;
                payerName = userData.name;
                payerEmail = userData.email;
            }
        }

        let batchName = '';
        if (batchId) {
            const batchSnapshot = await getDoc(batchId);
            if (batchSnapshot.exists()) {
                batchName = batchSnapshot.data().name;
            }
        }

        if (paymentId.id) {
            participants.push({
                name: payerName,
                email: payerEmail,
                batchName: batchName,
                paymentId: paymentId ? paymentId.id : null,
            });
        } else {
            participants.push({
                name: payerName,
                email: payerEmail,
                batchName: batchName,
                paymentId: 'Cortesia',
            });
        }

        lastVisible = ticketSnapshot;
    }

    return { participants, lastVisible };
}
