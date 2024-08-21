import styles from '@/styles/VisaoGeral.module.scss';
import { formatDate as utilsFormatDate } from '@/utils/format/date';
import Link from 'next/link';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { db } from '@/lib/firebaseClient';
import {
    DocumentReference,
    Timestamp,
    collection,
    doc,
    getDocs,
    query,
    where,
} from 'firebase/firestore';

import AdminEventLayout from '@/layouts/AdminEventLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import { NextPageWithLayout } from '@/pages/_app';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getEventById } from '@/server/db/events/getEventById';
import { PaymentStatus } from '@/server/paymentGateways';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useMemo, useState } from 'react';

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

export const getServerSideProps = (async (context) => {
    const { eventId } = context.params as { eventId: string };

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

    const event = await getEventById(eventId);

    let approvedAmount = 0;
    let cancelledAmount = 0;
    let processingAmount = 0;
    let pendingAmount = 0;
    let totalRelevantValue = 0;
    let relevantPaymentsCount = 0;
    let soldTicketsCount = 0;

    const paymentsQuery = query(
        collection(db, 'payments'),
        where('eventId', '==', doc(db, 'events', eventId))
    );

    const querySnapshot = await getDocs(paymentsQuery);
    const payments: PaymentDTO[] = [];

    querySnapshot.forEach((doc) => {
        const {
            eventId,
            ticketsId,
            userId,
            dateCreated,
            dateApproved,
            ...paymentData
        } = doc.data() as PaymentData;

        payments.push({
            ...paymentData,
            dateCreated: dateCreated.toMillis(),
            dateApproved: dateApproved?.toMillis() ?? null,
        });

        if (
            paymentData.status === 'APPROVED' ||
            paymentData.status === 'AUTHORIZED'
        ) {
            totalRelevantValue += Number(paymentData.baseAmount) || 0;
            relevantPaymentsCount++;
            soldTicketsCount++;
        }

        switch (paymentData.status as PaymentStatus) {
            case 'APPROVED':
                approvedAmount += Number(paymentData.baseAmount) || 0;
                break;
            case 'REFUNDED':
            case 'CHARGED_BACK':
                cancelledAmount += Number(paymentData.baseAmount) || 0;
                break;
            case 'AUTHORIZED':
                processingAmount += Number(paymentData.baseAmount) || 0;
                break;
            case 'PENDING':
                pendingAmount += Number(paymentData.baseAmount) || 0;
                break;
            default:
                break;
        }
    });

    const averageTicket =
        relevantPaymentsCount > 0
            ? totalRelevantValue / relevantPaymentsCount
            : 0;

    return {
        props: {
            payments,
            approvedAmount,
            cancelledAmount,
            processingAmount,
            pendingAmount,
            averageTicket,
            event: event.eventData,
            soldTicketsCount,
        },
    };
}) satisfies GetServerSideProps;

const VisaoTransacoes: NextPageWithLayout<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({
    payments,
    approvedAmount,
    cancelledAmount,
    processingAmount,
    pendingAmount,
    event,
    averageTicket,
    soldTicketsCount,
}) => {
    const [displayedSoldTicketsCount, setDisplayedSoldTicketsCount] =
        useState(0);
    const [displayedApprovedAmount, setDisplayedApprovedAmount] = useState(0);
    const [displayedProcessingAmount, setDisplayedProcessingAmount] =
        useState(0);
    const [displayedPendingAmount, setDisplayedPendingAmount] = useState(0);
    const [displayedAverageTicket, setDisplayedAverageTicket] = useState(0);

    const router = useRouter();

    const { eventId } = router.query;

    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayedSoldTicketsCount((current) => {
                const nextValue = current + 1;
                if (nextValue >= soldTicketsCount) {
                    clearInterval(interval);
                    return soldTicketsCount;
                }
                return nextValue;
            });
        }, 20);

        return () => clearInterval(interval);
    }, [soldTicketsCount]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayedApprovedAmount((current) => {
                const nextValue = current + 50;
                if (nextValue >= approvedAmount) {
                    clearInterval(interval);
                    return approvedAmount;
                }
                return nextValue;
            });
        }, 5);

        return () => clearInterval(interval);
    }, [approvedAmount, processingAmount]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayedProcessingAmount((current) => {
                const nextValue = current + 50;
                if (nextValue >= processingAmount) {
                    clearInterval(interval);
                    return processingAmount;
                }
                return nextValue;
            });
        }, 5);
        return () => clearInterval(interval);
    }, [processingAmount]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayedPendingAmount((current) => {
                const nextValue = current + 3;
                if (nextValue >= pendingAmount) {
                    clearInterval(interval);
                    return pendingAmount;
                }
                return nextValue;
            });
        }, 20);
        return () => clearInterval(interval);
    }, [pendingAmount]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayedAverageTicket((current) => {
                const nextValue = current + 1;
                if (nextValue >= averageTicket) {
                    clearInterval(interval);
                    return averageTicket;
                }
                return Math.round(nextValue * 100) / 100;
            });
        }, 20);
        return () => clearInterval(interval);
    }, [averageTicket]);

    const handleButtonDetalhesVendasClick = () => {
        router.push(`/admin/visao-geral-transacoes/${event.id}`);
    };

    const data = payments
        .filter((payment) => payment.dateApproved != null)
        .map((payment) => ({
            date: payment.dateApproved!,
            dateFormatted: utilsFormatDate(new Date(payment.dateApproved!)),
            amount: payment.baseAmount,
        }));

    const groupedData = data.reduce(
        (acc: { [key: string]: PaymentSummary }, current) => {
            const dateKey = current.dateFormatted;
            if (!acc[dateKey]) {
                acc[dateKey] = {
                    date: current.date,
                    dateFormatted: dateKey,
                    amount: 0,
                };
            }
            acc[dateKey].amount += current.amount;
            return acc;
        },
        {}
    );

    const finalData = Object.values(groupedData);

    finalData.sort((a, b) => a.date - b.date);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            const formattedValue = value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });

            return (
                <div className={styles.customTooltip}>
                    <p className="label">{`Valor total: ${formattedValue}`}</p>
                </div>
            );
        }

        return null;
    };

    const links = useMemo(() => {
        return [
            {
                href: `/admin/dados-gerais/${eventId}`,
                label: 'Visão geral',
                active: true,
            },
        ];
    }, [eventId]);

    const transformedEvent = {
        slug: event.slug,
        id: event.id,
        name: event.name,
        isVisible: event.isVisible,
        startDate: event.startDateTimestamp,
        endDate: event.endDateTimestamp,
        fullAddress: `${event.address.street}, ${event.address.number}`,
    };

    return (
        <main className={styles.container}>
            <AdminEventLayout event={transformedEvent} links={links}>
                <div className={styles.contentArea}>
                    <div className={styles.allContent}>
                        <div className={styles.content}>
                            <div className={styles.topContainer}>
                                <div className={styles.resumeData}>
                                    <p className={styles.resumeTitle}>
                                        DETALHES DO EVENTO
                                    </p>
                                    <div className={styles.columnVisaoGeral}>
                                        <div className={styles.rowStatus}>
                                            <div
                                                className={
                                                    styles.leftSideRowStatus
                                                }
                                            >
                                                <span>Status</span>
                                                <div
                                                    className={
                                                        styles.titleContainer
                                                    }
                                                >
                                                    <div
                                                        className={styles.dot}
                                                        data-active={
                                                            event.isVisible &&
                                                            new Date(
                                                                event.endDateTimestamp
                                                            ) > new Date()
                                                        }
                                                    />
                                                    <p
                                                        className={
                                                            event.isVisible &&
                                                            new Date(
                                                                event.endDateTimestamp
                                                            ) > new Date()
                                                                ? styles.onlineClass
                                                                : styles.encerradoClass
                                                        }
                                                    >
                                                        {event.isVisible &&
                                                        new Date(
                                                            event.endDateTimestamp
                                                        ) > new Date()
                                                            ? 'Online'
                                                            : 'Encerrado'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                className={
                                                    styles.rightSideRowStatus
                                                }
                                            >
                                                <p>Ingressos vendidos</p>
                                                <span>
                                                    {displayedSoldTicketsCount}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.rowStatus}>
                                            <div className={styles.blockStatus}>
                                                <p>Visibilidade</p>
                                                <span>
                                                    {event.isVisible &&
                                                    new Date(
                                                        event.endDateTimestamp
                                                    ) > new Date()
                                                        ? 'Público'
                                                        : 'Encerrado'}
                                                </span>
                                            </div>
                                            <div className={styles.blockStatus}>
                                                <div
                                                    className={
                                                        styles.rowStatusPrevia
                                                    }
                                                >
                                                    <p>Página do evento</p>
                                                    <Link
                                                        href={`/evento/${event.slug}`}
                                                    >
                                                        <img src="/Link.svg" />
                                                    </Link>
                                                </div>
                                                <span>
                                                    www.ticketking.com.br
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className={styles.detailButton}
                                        onClick={
                                            handleButtonDetalhesVendasClick
                                        }
                                    >
                                        DETALHES DAS VENDAS
                                    </button>
                                </div>

                                <div className={styles.rightSideFinanceiro}>
                                    <div className={styles.topInfo}>
                                        <p>financeiro</p>
                                    </div>
                                    <div className={styles.columnFinanceiro}>
                                        <div className={styles.rowFinanceiro}>
                                            <div
                                                className={
                                                    styles.columnFinanceiroLeftSide
                                                }
                                            >
                                                <p>Vendas totais</p>
                                                <span>
                                                    {(
                                                        displayedApprovedAmount +
                                                        displayedProcessingAmount
                                                    ).toLocaleString('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL',
                                                    })}
                                                </span>
                                            </div>
                                            <div
                                                className={
                                                    styles.columnFinanceiroRightSide
                                                }
                                            >
                                                <p>
                                                    Em processamento (pendentes)
                                                </p>
                                                <span
                                                    className={styles.pendentes}
                                                >
                                                    {displayedPendingAmount
                                                        ? displayedPendingAmount.toLocaleString(
                                                              'pt-BR',
                                                              {
                                                                  style: 'currency',
                                                                  currency:
                                                                      'BRL',
                                                              }
                                                          )
                                                        : 'R$ 0'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.rowFinanceiro}>
                                            <div
                                                className={
                                                    styles.columnFinanceiroLeftSide
                                                }
                                            >
                                                <p>Total a receber</p>
                                                <span
                                                    className={
                                                        styles.normalSpan
                                                    }
                                                >
                                                    {(
                                                        (displayedApprovedAmount +
                                                            displayedProcessingAmount) *
                                                            0.88 +
                                                        Number.EPSILON
                                                    ).toLocaleString('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL',
                                                    })}
                                                </span>
                                            </div>
                                            <div
                                                className={
                                                    styles.columnFinanceiroRightSide
                                                }
                                            >
                                                <p>Total recebido</p>
                                                <span
                                                    className={
                                                        styles.normalSpan
                                                    }
                                                >
                                                    {(0).toLocaleString(
                                                        'pt-BR',
                                                        {
                                                            style: 'currency',
                                                            currency: 'BRL',
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.rowFinanceiro}>
                                            <div
                                                className={
                                                    styles.columnFinanceiroLeftSide
                                                }
                                            >
                                                <p>Ticket médio (bruto)</p>
                                                <span
                                                    className={
                                                        styles.normalSpan
                                                    }
                                                >
                                                    {displayedAverageTicket.toLocaleString(
                                                        'pt-BR',
                                                        {
                                                            style: 'currency',
                                                            currency: 'BRL',
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                            <div
                                                className={
                                                    styles.columnFinanceiroRightSide
                                                }
                                            >
                                                <p>Ticket médio (líquido)</p>
                                                <span
                                                    className={
                                                        styles.normalSpan
                                                    }
                                                >
                                                    {(
                                                        displayedAverageTicket *
                                                            0.88 +
                                                        Number.EPSILON
                                                    ).toLocaleString('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL',
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.graphData}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={finalData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="dateFormatted" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <YAxis
                                            label={{
                                                value: 'Vendas totais',
                                                angle: -90,
                                                position: 'insideLeft',
                                            }}
                                        />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#8000ff"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminEventLayout>
        </main>
    );
};

VisaoTransacoes.getLayout = function getLayout(page: ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default VisaoTransacoes;
