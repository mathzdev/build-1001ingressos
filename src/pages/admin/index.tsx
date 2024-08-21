import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../../styles/MeusEventos.module.scss';

import DashboardLayout from '@/layouts/DashboardLayout';
import { getEvents } from '@/server/db/events/getEvents';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { ReactElement } from 'react';
import { NextPageWithLayout } from '../_app';
import { authOptions } from '../api/auth/[...nextauth]';

interface EventDisplay {
    id: string;
    status: string;
    evento: string;
    quando: string;
    onde: string;
    tipo: string;
    ingressos: number;

    ingressosTotais: number;
}

const MeusEventos: NextPageWithLayout<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ events }) => {
    const router = useRouter();

    const handleEditClick = (docId: any) => {
        router.push(`/admin/administrar-participantes/${docId}`);
    };

    const [eventos, setEventos] = useState<EventDisplay[]>([]);

    useEffect(() => {
        const eventsMap = events?.map((event: any) => {
            // Aggregate the amounts across all batches
            const ingressos = event.batches.reduce(
                (acc: number, batch: any) => acc + batch.availableAmount,
                0
            );
            const ingressosTotais = event.batches.reduce(
                (acc: number, batch: any) => acc + batch.startAmount,
                0
            );

            console.log(event.batches);

            return {
                id: event.id,
                status: 'Ativo',
                evento: event.name,
                quando:
                    new Date(event.startDateTimestamp).toDateString() || 'N/A',
                onde: `${event.address.street} ${event.address.number}`,
                tipo: event.batches[0]?.description || 'N/A', // Assuming the first batch's description is what you want
                ingressos,
                ingressosTotais,
            };
        });

        setEventos(eventsMap);
    }, []);

    const [statusTransacao, setStatusTransacao] = useState('');

    const [participantes, setParticipantes] = useState(eventos);
    const [pesquisa, setPesquisa] = useState('');
    const [resultadosFiltrados, setResultadosFiltrados] =
        useState(participantes);

    useEffect(() => {
        const transformedEvents = events.map((event: any) => {
            const ingressos = event.batches.reduce(
                (acc: number, batch: any) => acc + batch.availableAmount,
                0
            );
            const ingressosTotais = event.batches.reduce(
                (acc: number, batch: any) => acc + batch.startAmount,
                0
            );
            return {
                id: event.id,
                status: 'Ativo',
                evento: event.name,
                quando:
                    new Date(event.startDateTimestamp).toDateString() || 'N/A',
                onde: `${event.address.street} ${event.address.number}`,
                tipo: event.batches[0].description,
                ingressos,
                ingressosTotais,
            };
        });

        setEventos(transformedEvents);

        let filtrados = transformedEvents;

        if (pesquisa !== '') {
            filtrados = filtrados.filter((evento: any) =>
                evento.evento.toLowerCase().includes(pesquisa.toLowerCase())
            );
        }

        if (statusTransacao === 'aprovadas') {
            filtrados = filtrados.filter(
                (evento: any) => evento.status === 'Aprovada'
            );
        } else if (statusTransacao === 'reprovadas') {
            filtrados = filtrados.filter(
                (evento: any) => evento.status === 'Reprovada'
            );
        }

        setResultadosFiltrados(filtrados);
    }, [events, pesquisa, statusTransacao]);

    const limparFiltros = () => {
        setPesquisa('');
        setStatusTransacao('todas');
    };

    const handleEventClick = (eventId: string) => {
        router.push(`/admin/dados-gerais/${eventId}`);
    };

    const Progress = ({
        eventId,
        totalTickets,
    }: {
        eventId: string;
        totalTickets: number;
    }) => {
        const [soldTickets, setSoldTickets] = useState(0);
        const [style, setStyle] = useState({});

        useEffect(() => {
            const fetchSoldTickets = async () => {
                try {
                    const response = await fetch(
                        `/api/tickets/getPayedTicketsByEventId/${eventId}`
                    );
                    const data = await response.json();
                    setSoldTickets(Number(data.soldTicketsCount));
                } catch (error) {
                    console.error('Erro ao buscar ingressos vendidos', error);
                }
            };

            fetchSoldTickets();

            const percentage = (soldTickets / totalTickets) * 100;

            const timer = setTimeout(() => {
                setStyle({
                    opacity: 1,
                    width: `${percentage}%`,
                });
            }, 200);

            return () => clearTimeout(timer);
        }, [eventId, soldTickets, totalTickets]);

        return (
            <div className={styles.progress}>
                <div className={styles.progressDone} style={style}>
                    <text>{soldTickets}</text>
                </div>
                <div className={styles.progressTotal}>{totalTickets}</div>
            </div>
        );
    };

    const handleClearSearch = () => {
        setPesquisa('');
    };

    return (
        <main className={styles.container}>
            <div className={styles.contentArea}>
                <div className={styles.allContent}>
                    <div className={styles.content}>
                        <p className={styles.title}>
                            Crie um evento novo hoje:
                        </p>
                        <div className={styles.participantsData}>
                            <div className={styles.messageContent}>
                                <img
                                    src="/purpleTicket.svg"
                                    alt=""
                                    className={styles.ticket}
                                />
                                <p className={styles.ticketTitle}>
                                    Evento presencial
                                </p>
                                <p className={styles.ticketDesc}>
                                    Vendas online e ferramentas para gestão de
                                    acesso/portaria em espaço físico.{' '}
                                    <span>Saiba mais </span>
                                </p>
                                <Link href={'/admin/criar-evento'}>
                                    <button className={styles.ticketButton}>
                                        CRIAR AGORA
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <div className={styles.eventData}>
                            <p className={styles.resumeTitle}>MEUS EVENTOS</p>

                            <div className={styles.searchContainer}>
                                <div className={styles.right}>
                                    <p className={styles.selectTitle}>
                                        Buscar pelo nome do evento
                                    </p>
                                    <div className={styles.search}>
                                        <img src="/search.svg" alt="" />
                                        <input
                                            className={styles.searchInput}
                                            type="text"
                                            placeholder="Buscar pelo nome do evento"
                                            value={pesquisa}
                                            onChange={(e) =>
                                                setPesquisa(e.target.value)
                                            }
                                        />

                                        <img
                                            src="/closeSearch.svg"
                                            alt=""
                                            onClick={handleClearSearch}
                                        />
                                    </div>
                                </div>
                            </div>

                            <section className={styles.tableContainer}>
                                <header className={styles.tableHeader}>
                                    <p>
                                        <b>STATUS</b>
                                    </p>
                                    <p>
                                        <b>EVENTO</b>
                                    </p>
                                    <p>
                                        <b>QUANDO</b>
                                    </p>
                                    <p>
                                        <b>TIPO</b>
                                    </p>
                                    <p>
                                        <b>ONDE</b>
                                    </p>
                                    <p>
                                        <b>INGRESSOS</b>
                                    </p>
                                    <p>
                                        <b>SOBRE</b>
                                    </p>
                                </header>
                                {resultadosFiltrados.length > 0 ? (
                                    resultadosFiltrados.map(
                                        (participante, index) => {
                                            return (
                                                <section
                                                    className={styles.tableRow}
                                                    key={index}
                                                    onClick={() =>
                                                        handleEventClick(
                                                            participante.id
                                                        )
                                                    }
                                                >
                                                    <p>{participante.status}</p>
                                                    <p>{participante.evento}</p>
                                                    <p>{participante.quando}</p>
                                                    <p>{participante.tipo}</p>
                                                    <p>{participante.onde}</p>
                                                    <p
                                                        className={
                                                            styles.progressData
                                                        }
                                                    >
                                                        <Progress
                                                            eventId={
                                                                participante.id
                                                            }
                                                            totalTickets={
                                                                participante.ingressosTotais
                                                            }
                                                        />
                                                    </p>

                                                    <div
                                                        className={
                                                            styles.buttonVerEvento
                                                        }
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handleEventClick(
                                                                    participante.id
                                                                )
                                                            }
                                                        >
                                                            VER EVENTO
                                                        </button>
                                                    </div>
                                                </section>
                                            );
                                        }
                                    )
                                ) : (
                                    <section className={styles.tableRow}>
                                        <p className={styles.tableFullWidth}>
                                            Nenhum evento encontrado.
                                        </p>
                                    </section>
                                )}
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

MeusEventos.getLayout = function getLayout(page: ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default MeusEventos;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    );

    const events = await getEvents();

    let soldTicketsCount = 0;

    if (!session) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }

    const isConcierge = session.user.roleId === 'xVN8VdZ5MpRnvGJRFOZ3';

    if (isConcierge) {
        return {
            redirect: {
                destination: '/scan',
                permanent: false,
            },
        };
    }

    const adminRoles = ['X0v3WRX84lSVCK6wsRM5', 'Fuz4gzZy95ZVoj8dJgIo'];
    const isAdmin =
        session.user.roleId && adminRoles.includes(session.user.roleId);

    if (!isAdmin) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }

    return {
        props: { events },
    };
};
