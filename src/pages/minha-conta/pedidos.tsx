import Button from '@/components/Button';
import ArrowIcon from '@/icons/ArrowIcon';
import BtnEditIcon from '@/icons/BtnEditIcon';
import BtnHomeIcon from '@/icons/BtnHomeIcon';
import BtnOrdersIcon from '@/icons/BtnOrdersIcon';
import BtnOutIcon from '@/icons/BtnOutIcon';
import LogoTicketKing from '@/icons/LogoTicketKing';
import NavHomeIcon from '@/icons/NavHomeIcon';
import NavPerfilIcon from '@/icons/NavPerfilIcon';
import NavSearchIcon from '@/icons/NavSearchIcon';
import { db } from '@/lib/firebaseClient';
import { EventData } from '@/server/db/events/types';
import { TicketStatus } from '@/server/db/tickets/types';
import { formatDate, formatTime } from '@/utils/format/date';
import {
    DocumentData,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from 'firebase/firestore';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MouseEvent } from 'react';
import styles from '../../styles/MinhaContaPedidos.module.scss';
import { TicketData } from '../admin/visao-geral/[eventId]';
import { authOptions } from '../api/auth/[...nextauth]';

function parseTicketStatus(status: TicketStatus) {
    switch (status) {
        case 'PAID':
            return 'Pago';
        case 'PENDING_PAYMENT':
            return 'Pagamento pendente';
        case 'PROCESSING_PAYMENT':
            return 'Processando pagamento';
        case 'REFUNDED':
            return 'Reembolsado';
        case 'INVALIDATED':
            return 'Cancelado';
        case 'SCANNED':
            return 'Utilizado';
        default:
            return 'Indísponivel';
    }
}

export const getServerSideProps = (async (context) => {
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
    const ticketsQuery = query(
        collection(db, 'tickets'),
        where('userId', '==', userRef)
    );

    const ticketsSnapshot = await getDocs(ticketsQuery);

    const tickets: {
        eventName: string;
        eventBannerUrl: string;
        eventDate: string;
        id: string;
        batchName: string;
        status: string;
        isLocked: boolean;
        dateScanned: string | null;
    }[] = [];

    await Promise.all(
        ticketsSnapshot.docs.map(async (ticketSnapshot) => {
            const { eventId, ...ticketData } =
                ticketSnapshot.data() as TicketData;

            const eventSnapshot = await getDoc(eventId);
            const eventData = eventSnapshot.data() as EventData;

            const batchSnapshot = await getDoc(ticketData.batchId);
            const batchData = batchSnapshot.data() as DocumentData;

            tickets.push({
                eventName: eventData.name,
                eventBannerUrl: eventData.bannerUrl,
                eventDate: eventData.startDate.toDate().toISOString(),
                id: ticketSnapshot.id,
                batchName: batchData.name,
                status: parseTicketStatus(ticketData.status),
                isLocked: ticketData.status !== 'PAID',
                dateScanned: ticketData.dateScanned
                    ? ticketData.dateScanned.toDate().toISOString()
                    : null,
            });
        })
    );

    return {
        props: {
            tickets,
        },
    };
}) satisfies GetServerSideProps;

export default function MinhaContaPedidos({
    tickets,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter();

    const navigateTo = (path: any) => {
        router.push(`/minha-conta/${path}`);
    };

    const handleSignOut = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        await signOut();
    };

    const sortedTickets = tickets.sort((a, b) => {
        const aDate = new Date(a.eventDate);
        const bDate = new Date(b.eventDate);
        if (a.isLocked && !b.isLocked) {
            return 1;
        }
        if (!a.isLocked && b.isLocked) {
            return -1;
        }
        if (aDate > bDate) {
            return 1;
        }
        if (aDate < bDate) {
            return -1;
        }
        return 0;
    });

    return (
        <>
            <div className={styles.container}>
                <header>
                    <Link href="#" onClick={router.back}>
                        <ArrowIcon />
                    </Link>
                    <h1>Minha Conta</h1>
                    <LogoTicketKing className={styles.logo} />
                </header>

                <div className={styles.bodyContent}>
                    <div className={styles.buttonsContent}>
                        <button
                            className={styles.button}
                            onClick={() => navigateTo('')}
                        >
                            <BtnHomeIcon />
                            <p>Início</p>
                        </button>
                        <button
                            className={styles.buttonActive}
                            onClick={() => navigateTo('pedidos')}
                        >
                            <BtnOrdersIcon />
                            <p>Meus ingressos</p>
                        </button>
                        <button
                            className={styles.button}
                            onClick={() => navigateTo('editar')}
                        >
                            <BtnEditIcon />
                            <p>Editar conta</p>
                        </button>
                        <button
                            className={styles.button}
                            onClick={handleSignOut}
                        >
                            <BtnOutIcon data-stroke="true" />
                            <p>Sair da conta</p>
                        </button>
                    </div>

                    <p className={styles.order}>Seus ingressos</p>

                    <main>
                        {sortedTickets.map((ticket) => {
                            const TicketButton = () => (
                                <Button
                                    label={'Abrir ingresso'}
                                    className={styles.buttonGradient}
                                    disabled={ticket.isLocked}
                                    size="small"
                                />
                            );
                            const eventDate = new Date(ticket.eventDate);
                            return (
                                <section
                                    className={styles.eventCard}
                                    key={ticket.id}
                                >
                                    <img src={ticket.eventBannerUrl} alt="" />
                                    <section>
                                        <h3>{ticket.eventName}</h3>
                                        <div
                                            className={styles.eventDescription}
                                        >
                                            <div>
                                                <span>Lote</span>
                                                <p>{ticket.batchName}</p>
                                            </div>
                                            <div>
                                                <span>Data</span>
                                                <p>
                                                    {formatDate(eventDate)} -{' '}
                                                    {formatTime(eventDate)}
                                                </p>
                                            </div>
                                        </div>
                                        {!ticket.isLocked &&
                                        ticket.dateScanned === null ? (
                                            <Link
                                                href={
                                                    ticket.isLocked
                                                        ? '#'
                                                        : `/ticket/${ticket.id}`
                                                }
                                            >
                                                <TicketButton />
                                            </Link>
                                        ) : (
                                            <div
                                                className={styles.ticketStatus}
                                            >
                                                <BtnOrdersIcon />
                                                <p>
                                                    {ticket.status === 'Pago'
                                                        ? 'Utilizado'
                                                        : ticket.status}
                                                </p>
                                            </div>
                                        )}
                                    </section>
                                </section>
                            );
                        })}
                    </main>
                </div>

                <div className={styles.navBar}>
                    <Link href={'/pesquisar-evento'}>
                        <NavSearchIcon />
                    </Link>
                    <Link href={'/'}>
                        <NavHomeIcon />
                    </Link>{' '}
                    <Link href={'/minha-conta'}>
                        <NavPerfilIcon className={styles.navActive} />
                    </Link>
                </div>
            </div>
        </>
    );
}
