import styles from '@/styles/Participantes.module.scss';
import { useEffect, useMemo, useState } from 'react';

import { db } from '@/lib/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';

import AdminCard from '@/components/admin/AdminCard';
import AdminEventLayout from '@/layouts/AdminEventLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import { NextPageWithLayout } from '@/pages/_app';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { EventData } from '@/server/db/events/types';
import { getParticipants } from '@/server/db/participants/getParticipants';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';

interface EventPropsData extends Omit<EventData, 'organizerId'> {
    organizerId: {
        id: string;
    };
}

const CheckInOnline: NextPageWithLayout<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ event, participants }) => {
    const router = useRouter();
    const { eventId } = router.query;
    const [currentPage, setCurrentPage] = useState(1);
    const [lastDocSnapshot, setLastDocSnapshot] = useState<string | null>(null);
    const [pageCursors, setPageCursors] = useState<(string | null)[]>([null]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredParticipants, setFilteredParticipants] =
        useState(participants);

    const links = useMemo(() => {
        return [
            {
                href: `/admin/administrar-participantes/${eventId}`,
                label: 'Participantes',
                active: true,
            },
        ];
    }, [eventId]);

    const fetchParticipants = async () => {
        let url = `/api/participants/${eventId}/${lastDocSnapshot}`;
        const response = await fetch(url);
        const data = await response.json();
        const newParticipants = data.participants;
        if (newParticipants.length > 0) {
            setFilteredParticipants(newParticipants);
            setLastDocSnapshot(
                newParticipants[newParticipants.length - 1].email
            );
        }
    };

    const fetchSearchedParticipants = async (query: string) => {
        try {
            const response = await fetch(
                `/api/events/${eventId}/participants/search?query=${query.toLocaleLowerCase()}`
            );
            const data = await response.json();
            if (data.participants.length > 0) {
                setFilteredParticipants(data.participants);
            }
        } catch (error) {
            console.error('Erro ao buscar cupons', error);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleNextPage = () => {
        const newPageCursors = [...pageCursors];
        newPageCursors[currentPage] = lastDocSnapshot;
        setPageCursors(newPageCursors);
        setCurrentPage(currentPage + 1);
    };

    const handlePreviousPage = () => {
        setLastDocSnapshot(pageCursors[currentPage - 2]);
        setCurrentPage(currentPage - 1);
    };

    useEffect(() => {
        const cursor = currentPage > 1 ? pageCursors[currentPage - 1] : null;
        setLastDocSnapshot(cursor);
        fetchParticipants();
    }, [currentPage]);

    useEffect(() => {
        fetchSearchedParticipants(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        if (searchQuery === '') {
            setFilteredParticipants(participants);
        } else {
            const filtered = participants.filter((participants: any) =>
                participants.email
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            );
            setFilteredParticipants(filtered);
        }
    }, [searchQuery, participants]);

    return (
        <main className={styles.container}>
            <AdminEventLayout event={event} links={links}>
                <AdminCard title="Participantes do evento">
                    <div className={styles.contentCard__actions}>
                        <div className={styles.searchBar}>
                            <img src="/search.svg" alt="" />
                            <input
                                type="search"
                                placeholder="Digite o email completo do participante"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            <img
                                src="/closeSearch.svg"
                                alt=""
                                onClick={handleClearSearch}
                            />
                        </div>
                    </div>

                    <section className={styles.tableContainer}>
                        <header className={styles.tableHeader}>
                            <p>
                                <b>PARTICIPANTE</b>
                            </p>
                            <p>
                                <b>EMAIL</b>
                            </p>
                            <p>
                                <b>INGRESSO</b>
                            </p>
                            <p>
                                <b>ID DO PAGAMENTO</b>
                            </p>
                        </header>
                        {filteredParticipants.length > 0 ? (
                            filteredParticipants.map(
                                (participant: any, index: any) => (
                                    <section
                                        className={styles.tableRow}
                                        key={index}
                                    >
                                        <p>{participant.name}</p>
                                        <p>{participant.email}</p>
                                        <p>{participant.batchName}</p>
                                        <p>{participant.paymentId}</p>
                                    </section>
                                )
                            )
                        ) : (
                            <section className={styles.tableRow}>
                                <p className={styles.tableFullWidth}>
                                    Nenhum participante encontrado.
                                </p>
                            </section>
                        )}
                    </section>
                    <div className={styles.pagination}>
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className={styles.buttonArrow}
                        >
                            <img src="/leftArrowPagination.svg" />
                        </button>
                        <p>{currentPage}</p>
                        <button
                            onClick={handleNextPage}
                            disabled={filteredParticipants.length < 10}
                            className={styles.buttonArrow}
                        >
                            <img src="/rightArrowPagination.svg" />
                        </button>
                    </div>
                </AdminCard>
            </AdminEventLayout>
        </main>
    );
};

CheckInOnline.getLayout = function getLayout(page: ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default CheckInOnline;

export const getServerSideProps = (async (context) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    );

    if (!session || !session.user.roleId) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }

    const adminRoles = ['X0v3WRX84lSVCK6wsRM5', 'Fuz4gzZy95ZVoj8dJgIo'];
    const isAdmin = adminRoles.includes(session.user.roleId);

    if (!isAdmin) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }

    const { eventId: paramEventId } = context.params as { eventId: string };

    const { participants } = await getParticipants(paramEventId);

    const eventSnapshot = await getDoc(doc(db, 'events', paramEventId));
    let eventData = eventSnapshot.data() as EventPropsData;

    if (eventData && eventData.organizerId) {
        eventData = {
            ...eventData,
            organizerId: {
                id: eventData.organizerId.id,
            },
        };
    }

    let fullAddress = `${eventData.address.street}, ${
        eventData.address.number
    }${
        eventData.address.complement ? ' ' + eventData.address.complement : ''
    } - ${eventData.address.postalCode}`;

    return {
        props: {
            event: {
                id: eventSnapshot.id,
                ...eventData,
                startDate: eventData.startDate.toMillis(),
                endDate: eventData.endDate.toMillis(),
                fullAddress,
            },
            participants,
        },
    };
}) satisfies GetServerSideProps;
