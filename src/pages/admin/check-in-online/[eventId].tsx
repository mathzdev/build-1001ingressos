import styles from '@/styles/CheckInOnline.module.scss';
import { useEffect, useMemo, useState } from 'react';

import { db } from '@/lib/firebaseClient';
import {
    and,
    collection,
    doc,
    getDoc,
    getDocs,
    or,
    query,
    where,
} from 'firebase/firestore';

import Button from '@/components/Button';
import AdminCard from '@/components/admin/AdminCard';
import AdminEventLayout from '@/layouts/AdminEventLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import { getPostalCodeInfo } from '@/lib/cepClient';
import { NextPageWithLayout } from '@/pages/_app';
import { EventData } from '@/server/db/events/types';
import { formatDateTime } from '@/utils/format/date';
import axios, { isAxiosError } from 'axios';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import { toast } from 'react-toastify';
import { TicketData } from '../visao-geral/[eventId]';

interface AttendeeData {
    checkIn: 'Sim' | 'Não';
    name: string;
    dateAcquired: number;
    dateScanned: number;
    ticketId: string;
    paymentId: string;
    batchName: string;
}

interface UserData {
    name: string;
    cpf: string;
    phone: string;
    email: string;
    birthdate: string;
    savedEvents: string[];
}

export const getServerSideProps = (async (context) => {
    const { eventId: paramEventId } = context.params as {
        eventId: string;
    };
    const attendees: AttendeeData[] = [];

    const ticketsQuery = query(
        collection(db, 'tickets'),
        and(
            where('eventId', '==', doc(db, 'events', paramEventId)),
            or(where('status', '==', 'PAID'), where('status', '==', 'SCANNED'))
        )
    );

    const [eventSnapshot, ticketsSnapshot] = await Promise.all([
        getDoc(doc(db, 'events', paramEventId)),
        getDocs(ticketsQuery),
    ]);

    const { organizerId, startDate, endDate, ...eventData } =
        eventSnapshot.data() as EventData;

    let checkIns = 0;
    let pendingCheckIns = 0;

    for (const ticketSnapshot of ticketsSnapshot.docs) {
        const {
            eventId,
            userId,
            paymentId,
            batchId,
            dateAcquired,
            dateScanned,
            ...ticketData
        } = ticketSnapshot.data() as TicketData;

        if (eventId) {
            let payerName = '';
            if (userId) {
                const userDoc = await getDoc(userId);
                if (userDoc.exists()) {
                    const userData = userDoc.data() as UserData;
                    payerName = userData.name;
                }
            }

            if (dateScanned) {
                checkIns++;
            } else {
                pendingCheckIns++;
            }

            const batchSnapshot = await getDoc(batchId);
            const batchData = batchSnapshot.data() as {
                name: string;
            };

            attendees.push({
                checkIn: dateScanned ? 'Sim' : 'Não',
                name: payerName,
                dateAcquired: dateAcquired ? dateAcquired.toMillis() : 0,
                dateScanned: dateScanned ? dateScanned.toMillis() : 0,
                ticketId: ticketSnapshot.id,
                // @ts-ignore
                paymentId: paymentId === 'FREE' ? 'Gratuito' : paymentId.id,
                batchName: batchData.name,
            });
        }
    }

    let fullAddress = `${eventData.address.street}, ${
        eventData.address.number
    }${
        eventData.address.complement ? eventData.address.complement + ' ' : ''
    } - ${eventData.address.postalCode}`;

    try {
        const addressInfo = await getPostalCodeInfo(
            eventData.address.postalCode
        );
        fullAddress = `${addressInfo.logradouro}, ${eventData.address.number}${
            eventData.address.complement
                ? eventData.address.complement + ' '
                : ''
        } - ${addressInfo.localidade}, ${addressInfo.uf} - ${addressInfo.cep}`;
    } catch (error) {
        console.error(error);
    }

    return {
        props: {
            event: {
                id: eventSnapshot.id,
                ...eventData,
                startDate: startDate.toMillis(),
                endDate: endDate.toMillis(),
                fullAddress,
            },
            attendees,
            checkIns,
            pendingCheckIns,
        },
    };
}) satisfies GetServerSideProps;

const CheckInOnline: NextPageWithLayout<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ event, attendees, checkIns, pendingCheckIns }) => {
    const router = useRouter();
    const { eventId } = router.query;

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredAttendees, setFilteredAttendees] = useState(attendees);
    const [validatingTicketId, setValidatingTicketId] = useState<string>();

    const links = useMemo(() => {
        return [
            {
                href: `/admin/visao-geral/${eventId}`,
                label: 'Visão geral',
                active: false,
            },
            {
                href: `/admin/check-in-online/${eventId}`,
                label: 'Check-in online',
                active: true,
            },
            {
                href: `/admin/check-in-scanner/${eventId}`,
                label: 'Check-in via scanner',
                active: false,
            },
        ];
    }, [eventId]);

    useEffect(() => {
        if (searchQuery === '') {
            setFilteredAttendees(attendees);
        } else {
            const filtrados = attendees.filter((attendee) =>
                attendee.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredAttendees(filtrados);
        }
    }, [searchQuery, attendees]);

    const handleCheckIn = async (ticketId: string) => {
        toast.promise(
            async () => {
                setValidatingTicketId(ticketId);
                await axios.post<{
                    batchName: string;
                    scannedBy: {
                        id: string;
                        name: string;
                    };
                }>('/api/tickets/validate', {
                    ticketId,
                });
            },
            {
                pending: 'Verificando ticket...',
                success: {
                    render({ data }) {
                        setValidatingTicketId(undefined);
                        return 'Ticket validado com sucesso!';
                    },
                },
                error: {
                    render({ data: error }) {
                        let message = 'Não foi possível validar o ticket.';
                        setValidatingTicketId(undefined);

                        if (
                            isAxiosError<{
                                error: string;
                                message: string;
                                data?: {
                                    name: string;
                                };
                            }>(error)
                        ) {
                            const responseData = error.response?.data;
                            switch (error.response?.data.error) {
                                case 'unauthorized':
                                case 'forbidden':
                                    message =
                                        'Você não tem permissão para validar este ticket.';
                                    break;
                                case 'not_found':
                                    message = 'Ticket não encontrado.';
                                    break;
                                case 'ticket_already_scanned':
                                    message = responseData?.data?.name
                                        ? `Ticket já validado por ${responseData?.data?.name}.`
                                        : `Ticket já validado.`;
                                    break;
                                case 'not_paid':
                                    message = 'Ticket não foi pago.';
                                    break;
                                default:
                                    break;
                            }
                        }
                        return message;
                    },
                },
            }
        );
    };

    return (
        <main className={styles.container}>
            <AdminEventLayout event={event} links={links}>
                <AdminCard title="Check-in participantes">
                    <div className={styles.contentCard__actions}>
                        <div className={styles.searchBar}>
                            <img src="/search.svg" alt="" />
                            <input
                                type="search"
                                placeholder="Nome, email, nº do ingresso ou pedido"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            <img src="/closeSearch.svg" alt="" />
                        </div>

                        <div className={styles.buttonsContainer}>
                            <Button
                                label="Limpar check-ins"
                                variant="admin"
                                size="small"
                            />
                            <Button
                                label="Atualizar lista"
                                variant="admin"
                                size="small"
                            />
                        </div>
                    </div>

                    <section className={styles.tableContainer}>
                        <header className={styles.tableHeader}>
                            <p>
                                <b>PARTICIPANTE</b>
                            </p>
                            <p>
                                <b>ID INGRESSO</b>
                            </p>
                            <p>
                                <b>INGRESSO</b>
                            </p>
                            <p>
                                <b>PEDIDO</b>
                            </p>
                            <p>
                                <b>CHECK-IN</b>
                            </p>
                        </header>
                        {filteredAttendees.length > 0 ? (
                            filteredAttendees.map((attendee, index) => (
                                <section
                                    className={styles.tableRow}
                                    key={index}
                                >
                                    <p>{attendee.name}</p>
                                    <p>{attendee.ticketId}</p>
                                    <p>{attendee.batchName}</p>
                                    <p>{attendee.paymentId}</p>
                                    <p>
                                        {attendee.dateScanned > 0 ? (
                                            formatDateTime(
                                                new Date(attendee.dateScanned)
                                            )
                                        ) : (
                                            <Button
                                                label="Fazer Check-In"
                                                variant="admin"
                                                size="small"
                                                disabled={
                                                    attendee.ticketId ===
                                                    validatingTicketId
                                                }
                                                onClick={async (e) => {
                                                    e.preventDefault();

                                                    await handleCheckIn(
                                                        attendee.ticketId
                                                    );
                                                    attendee.dateScanned =
                                                        Date.now();
                                                }}
                                            />
                                        )}
                                    </p>
                                </section>
                            ))
                        ) : (
                            <section className={styles.tableRow}>
                                <p className={styles.tableFullWidth}>
                                    Nenhum participante encontrado.
                                </p>
                            </section>
                        )}
                    </section>
                </AdminCard>
            </AdminEventLayout>
        </main>
    );
};

CheckInOnline.getLayout = function getLayout(page: ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default CheckInOnline;
