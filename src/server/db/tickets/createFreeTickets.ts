import { db } from '@/lib/firebaseClient';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    increment,
    updateDoc,
} from 'firebase/firestore';
import { Options, QRCodeCanvas } from 'styled-qr-code-node';
import { BatchData, EventData, OrganizerData } from '../events/types';
import { FreeTicketDTO } from './types';

export async function createFreeTickets(
    amount: number,
    eventId: string,
    batchId: string,
    userId: string
) {
    const batchRef = doc(db, 'events', eventId, 'batches', batchId);
    const eventRef = doc(db, 'events', eventId);

    const [batchSnapshot, eventSnapshot] = await Promise.all([
        getDoc(batchRef),
        getDoc(eventRef),
    ]);

    if (!batchSnapshot.exists()) {
        throw new Error('Batch not found');
    }

    if (!eventSnapshot.exists()) {
        throw new Error('Event not found');
    }

    const batchData = batchSnapshot.data() as BatchData;
    const eventData = eventSnapshot.data() as Omit<EventData, 'batches'>;

    const organizerSnapshot = await getDoc(eventData.organizerId);
    const organizerData = organizerSnapshot.data() as OrganizerData;

    if (!organizerData.users[userId]) {
        throw new Error('User is not an organizer');
    }

    const ticketCollectionRef = collection(db, 'tickets');
    const tickets: FreeTicketDTO[] = [];

    for (let i = 0; i < amount; i++) {
        const ticket = {
            batch: {
                name: batchData.name,
                description: batchData.description,
                price: batchData.price,
            },
            event: {
                name: eventData.name,
                bannerUrl: eventData.bannerUrl,
                address: eventData.address,
                startDate: eventData.startDate.toMillis(),
                endDate: eventData.endDate.toMillis(),
            },
            user: {
                name: `${batchData.name} - Ingresso ${
                    batchData.startAmount - batchData.availableAmount + i + 1
                }`,
                email: null,
                cpf: null,
                phone: null,
            },
            organizer: {
                name: organizerData.name,
                contact: organizerData.contact,
            },
            status: 'PAID' as const,
            price: 0,
            paymentId: 'FREE',
        };

        const ticketRef = await addDoc(ticketCollectionRef, {
            ...ticket,
            batchId: batchRef,
            eventId: eventRef,
            userId: doc(db, 'users', userId),
            organizerId: eventData.organizerId,
            dateReserved: new Date(),
            dateAcquired: new Date(),
        });

        const data = `1001Ingressos://ticket.validate/${ticketRef.id}`;

        const options: Options = {
            width: 300,
            height: 300,
            data,
            image: 'https://firebasestorage.googleapis.com/v0/b/ticket-king-6be25.appspot.com/o/ticket_king.png?alt=media&token=42636a31-b042-45ca-82f4-959c87aef4a5',
            margin: 0,
            qrOptions: {
                typeNumber: 0,
                mode: 'Byte',
                errorCorrectionLevel: 'Q',
            },
            imageOptions: {
                hideBackgroundDots: true,
                imageSize: 0.4,
                margin: 0,
            },
            dotsOptions: { type: 'extra-rounded', color: '#6b6b6b' },
            backgroundOptions: { color: '#ffffff' },
            cornersSquareOptions: {
                type: 'extra-rounded',
                color: '#000000',
            },
            cornersDotOptions: { type: 'dot', color: '#000000' },
        };

        const qrCode = new QRCodeCanvas(options);

        const qrCodeData = await qrCode.toDataUrl('image/png');

        await updateDoc(ticketRef, {
            qrCode: qrCodeData,
        });

        tickets.push({
            ...ticket,
            id: ticketRef.id,
            qrCode: qrCodeData,
        });
    }
    await updateDoc(batchRef, {
        availableAmount: increment(-amount),
    });

    return {
        tickets,
    };
}
