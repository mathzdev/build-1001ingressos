import TicketFull from '@/components/TicketFull';
import ArrowIcon from '@/icons/ArrowIcon';
import { db } from '@/lib/firebaseClient';
import { TicketStatus } from '@/server/db/tickets/types';
import styles from '@/styles/Ticket.module.scss';
import { DocumentReference, Timestamp, doc, getDoc } from 'firebase/firestore';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useQRCode } from 'next-qrcode';
import Link from 'next/link';
import { authOptions } from '../api/auth/[...nextauth]';

const EVENT_DATE = new Date('2023-12-13T14:00:00');

const getMonthName = (date: Date) => {
    return date
        .toLocaleString('pt-BR', { month: 'short' })
        .replace('.', '')
        .toUpperCase();
};
const getMontNumber = (date: Date) => {
    return date
        .toLocaleString('pt-BR', { month: '2-digit' })
        .replace('.', '')
        .toUpperCase();
};

export const getServerSideProps = (async (context) => {
    const { id } = context.params as { id: string };

    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    );

    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    const userRef = doc(db, 'users', session.user.id);

    const ticketRef = doc(db, 'tickets', id);
    const ticketSnapshot = await getDoc(ticketRef);

    if (!ticketSnapshot.exists()) {
        return {
            notFound: true,
        };
    }

    const ticketData = ticketSnapshot.data() as {
        batchId: DocumentReference;
        eventId: DocumentReference;
        paymentId: DocumentReference;
        userId: DocumentReference;
        status: TicketStatus;
        qrCode: string;
        dateAcquired: string;
        dateReserved: number;
        price: number;
    };

    if (ticketData.userId.id !== userRef.id) {
        return {
            notFound: true,
        };
    }

    if (ticketData.status !== 'PAID') {
        return {
            notFound: true,
        };
    }

    const batchSnapshot = await getDoc(ticketData.batchId);
    const batchData = batchSnapshot.data() as {
        name: string;
    };

    const eventSnapshot = await getDoc(ticketData.eventId);
    const eventData = eventSnapshot.data() as {
        name: string;
        bannerUrl: string;
        organizerId: DocumentReference;
        startDate: Timestamp;
    };

    const organizerSnapshot = await getDoc(eventData.organizerId);
    const organizerData = organizerSnapshot.data() as {
        name: string;
    };

    return {
        props: {
            ticket: {
                id: ticketRef.id,
                name: batchData.name,
                qrCode: ticketData.qrCode,
            },
            event: {
                name: eventData.name,
                bannerUrl: eventData.bannerUrl,
                startDate: eventData.startDate.toMillis(),
            },
            organizer: {
                name: organizerData.name,
            },
        },
    };
}) satisfies GetServerSideProps;

export default function Ticket({
    ticket,
    organizer,
    event,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { data: session } = useSession();
    const month = getMonthName(EVENT_DATE);
    const monthNumber = getMontNumber(EVENT_DATE);
    const day = EVENT_DATE.getDate();
    const { Canvas } = useQRCode();

    return (
        <section className={styles.container}>
            <div className={styles.detalhesEvento}>
                <div className={styles.headerEvento}>
                    <Link href="/minha-conta">
                        <ArrowIcon />
                    </Link>
                    <p>Detalhes do ingresso</p>
                </div>
                <div className={styles.content}>
                    <img
                        className={styles.bannerCheckout}
                        src={event.bannerUrl}
                    />

                    <TicketFull
                        qrCode={ticket.qrCode}
                        eventName={event.name}
                        name={session?.user.name ?? ''}
                        eventPlace={organizer.name}
                        ticketBatch={ticket.name}
                        ticketCode={ticket.id}
                        eventDate={new Date(event.startDate)}
                    />
                </div>
            </div>
        </section>
    );
}
