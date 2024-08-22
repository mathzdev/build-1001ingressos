import { db } from '@/lib/firebaseClient';
import styles from '@/styles/Visao.module.scss';
import {
    DocumentReference,
    Timestamp,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from 'firebase/firestore';
import Link from 'next/link';

import DashboardLayout from '@/layouts/DashboardLayout';
import { NextPageWithLayout } from '@/pages/_app';
import { BatchData } from '@/server/db/events/types';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { ReactElement } from 'react';

import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { TicketStatus } from '@/server/db/tickets/types';
import { getServerSession } from 'next-auth';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Cell, Pie, ResponsiveContainer } from 'recharts';
const PieChart = dynamic(
    () => import('recharts').then((recharts) => recharts.PieChart),
    {
        ssr: false,
    }
);

const COLORS = ['#8000ff', '#b8b8b8'];

export interface TicketData {
    userId: DocumentReference;
    batchId: DocumentReference;
    batchName: string;
    couponId: DocumentReference;
    paymentId: DocumentReference;
    eventId: DocumentReference;
    organizerId: DocumentReference;
    dateAcquired?: Timestamp | null;
    dateScanned?: Timestamp | null;
    dateReserved?: Timestamp | null;
    scannedBy: {
        id: string;
        name: string;
    };
    status: TicketStatus;
}

type TicketDTO = Omit<
    TicketData,
    | 'batchId'
    | 'eventId'
    | 'paymentId'
    | 'userId'
    | 'organizerId'
    | 'dateAcquired'
    | 'dateScanned'
    | 'dateReserved'
> & {
    dateAcquired: number | null;
    dateScanned: number | null;
    dateReserved: number | null;
};

export const getServerSideProps = (async (context) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    );

    if (!session) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }

    const { eventId } = context.params as {
        eventId: string;
    };

    const tickets: TicketDTO[] = [];

    const ticketsQuery = query(
        collection(db, 'tickets'),
        where('eventId', '==', doc(db, `/events/${eventId}`))
    );

    const ticketsSnapshot = await getDocs(ticketsQuery);

    let alreadyCheckedIn = 0;
    let pendingCheckIns = 0;

    const batches: {
        [id: string]: {
            name: string;
            checkIns: number;
        };
    } = {};

    for (const ticketSnapshot of ticketsSnapshot.docs) {
        const {
            batchId,
            eventId,
            paymentId,
            userId,
            organizerId,
            dateAcquired,
            dateScanned,
            dateReserved,
            ...ticketData
        } = ticketSnapshot.data() as TicketData;

        const batchSnapshot = await getDoc(batchId);
        const batchData = batchSnapshot.data() as BatchData;
        if (!batches[batchId.id]) {
            batches[batchId.id] = {
                name: batchData.name,
                checkIns: 0,
            };
        }

        const parsedDateReserved = dateReserved
            ? typeof dateReserved === 'string'
                ? new Date(dateReserved).getTime()
                : dateReserved.toMillis()
            : null;

        tickets.push({
            ...ticketData,
            dateScanned: dateScanned?.toMillis() ?? null,
            dateAcquired: dateAcquired?.toMillis() ?? null,
            dateReserved: parsedDateReserved,
            batchName: batchData.name,
        });
        if (dateScanned) {
            alreadyCheckedIn++;
            batches[batchId.id].checkIns++;
        } else {
            pendingCheckIns++;
        }
    }

    const alreadyCheckedInData = [
        {
            name: 'Check-ins realizados',
            value: alreadyCheckedIn,
        },
        {
            name: 'Check-ins pendentes',
            value: pendingCheckIns,
        },
    ];

    const pendingCheckInsData = [
        {
            name: 'Check-ins pendentes',
            value: pendingCheckIns,
        },
        {
            name: 'Check-ins realizados',
            value: alreadyCheckedIn,
        },
    ];

    return {
        props: {
            tickets,
            batches,
            alreadyCheckedIn,
            pendingCheckIns,
            pendingCheckInsData,
            alreadyCheckedInData,
        },
    };
}) satisfies GetServerSideProps;

const VisaoGeral: NextPageWithLayout<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({
    tickets,
    batches,
    alreadyCheckedIn,
    pendingCheckIns,
    pendingCheckInsData,
    alreadyCheckedInData,
}) => {
    const router = useRouter();
    const { eventId } = router.query;

    return (
        <main className={styles.container}>
            <header className={styles.headerArea}>
                <div className={styles.Head}>
                    <div className={styles.leftHead}>
                        <img
                            src="/greenCircle.svg"
                            alt=""
                            className={styles.greenCircle}
                        />
                        <p className={styles.title}>1001 Ingressos</p>
                        <img src="/Link.svg" alt="" />
                    </div>

                    <div className={styles.rightHead}>
                        <button className={styles.headButton}>
                            EDITAR EVENTO
                        </button>
                        {/* <button className={styles.headButton}>
                                    EXPORTAR PARTICIPANTES
                                </button>
                                <button className={styles.headButton}>
                                    IMPRIMIR LISTA
                                </button> */}
                    </div>
                </div>

                <div className={styles.Data}>
                    <div className={styles.dataArea}>
                        <img src="/Calendar.svg" alt="" />
                        <p className={styles.dataValue}>
                            Quarta, 08/11/2023, 10h - Sexta, 10/11/2023, 10h
                        </p>
                    </div>

                    <div className={styles.dataArea}>
                        <img src="/local.svg" alt="" />

                        <p className={styles.dataValue}>
                            Local a definir, Curitiba, PR
                        </p>
                    </div>
                </div>

                <div className={styles.Nav}>
                    <p className={styles.navItemActive}>VISÃO GERAL</p>
                    <Link href={`/admin/check-in-online/${eventId}`}>
                        <p className={styles.navItem}>CHECK-IN ONLINE</p>
                    </Link>
                    <Link href={`/admin/check-in-scanner/${eventId}`}>
                        <p className={styles.navItem}>CHECK-IN VIA SCANNER</p>
                    </Link>
                    {/* <Link href={'/etiquetas'}>
                                <p className={styles.navItem}>ETIQUETAS</p>
                            </Link> */}
                </div>
            </header>
            <div className={styles.contentArea}>
                <div className={styles.allContent}>
                    <div className={styles.content}>
                        <section className={styles.resumeData}>
                            <h3 className={styles.resumeTitle}>
                                RESUMO DE CHECK-IN
                            </h3>

                            <div className={styles.chartContent}>
                                <div className={styles.chartWrapper}>
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        {/*@ts-ignore*/}
                                        <PieChart>
                                            <Pie
                                                data={alreadyCheckedInData}
                                                cx="50%"
                                                cy="50%"
                                                startAngle={225}
                                                endAngle={-45}
                                                innerRadius={75}
                                                outerRadius={85}
                                                fill="#8884d8"
                                                paddingAngle={2}
                                                dataKey="value"
                                                cornerRadius="100%"
                                            >
                                                {alreadyCheckedInData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                COLORS[
                                                                    index %
                                                                        COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    )
                                                )}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <span className={styles.chartValue}>
                                        {alreadyCheckedIn}
                                    </span>
                                </div>
                                <p className={styles.graphTitle}>Realizados</p>
                            </div>

                            <div className={styles.chartContent}>
                                <div className={styles.chartWrapper}>
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        {/*@ts-ignore*/}
                                        <PieChart>
                                            <Pie
                                                data={pendingCheckInsData}
                                                cx="50%"
                                                cy="50%"
                                                startAngle={225}
                                                endAngle={-45}
                                                innerRadius={75}
                                                outerRadius={85}
                                                fill="#8884d8"
                                                paddingAngle={2}
                                                dataKey="value"
                                                cornerRadius="100%"
                                            >
                                                {pendingCheckInsData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                COLORS[
                                                                    index %
                                                                        COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    )
                                                )}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <span className={styles.chartValue}>
                                        {pendingCheckIns}
                                    </span>
                                </div>
                                <p className={styles.graphTitle}>Restantes</p>
                            </div>
                        </section>

                        <section className={styles.flowData}>
                            <h3 className={styles.resumeTitle}>
                                FLUXO DE CHECK-IN
                            </h3>

                            <div className={styles.flowContent}>
                                <div className={styles.flowTitle}>
                                    Tipo de Ingresso
                                </div>
                                <div className={styles.flowTitle}>
                                    CHECK-INS REALIZADOS
                                </div>
                                {Object.keys(batches).length > 0 ? (
                                    Object.entries(batches).map(
                                        ([batchId, batch]) => (
                                            <>
                                                <div
                                                    key={`${batchId}-${batch.name}`}
                                                    className={
                                                        styles.tableValue
                                                    }
                                                >
                                                    {batch.name}
                                                </div>
                                                <div
                                                    key={`${batchId}-${batch.checkIns}`}
                                                    className={
                                                        styles.tableValue
                                                    }
                                                >
                                                    {batch.checkIns}
                                                </div>
                                            </>
                                        )
                                    )
                                ) : (
                                    <div
                                        className={`${styles.fullWidth} ${styles.tableValue}`}
                                    >
                                        Não há check-ins realizados.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
};

VisaoGeral.getLayout = function getLayout(page: ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default VisaoGeral;
