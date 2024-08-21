import styles from '@/styles/VisaoTransacoes.module.scss';

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
import { round } from '@/utils/number';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useMemo, useState } from 'react';

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

    const { eventId } = context.params as { eventId: string };

    const event = await getEventById(eventId);

    let approvedAmount = 0;
    let cancelledAmount = 0;
    let processingAmount = 0;
    let pendingAmount = 0;

    let totalPix = 0;
    let totalCreditCard = 0;

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

        switch (paymentData.status as PaymentStatus) {
            case 'APPROVED':
                approvedAmount += Number(paymentData.baseAmount) || 0;
                if (paymentData.method.type === 'PIX') {
                    totalPix += Number(paymentData.baseAmount) || 0;
                } else {
                    totalCreditCard += Number(paymentData.baseAmount) || 0;
                }
                break;
            case 'REFUNDED':
            case 'CHARGED_BACK':
                cancelledAmount += Number(paymentData.baseAmount) || 0;
                break;
            case 'AUTHORIZED':
                processingAmount += Number(paymentData.baseAmount) || 0;
                if (paymentData.method.type === 'PIX') {
                    totalPix += Number(paymentData.baseAmount) || 0;
                } else {
                    totalCreditCard += Number(paymentData.baseAmount) || 0;
                }
                break;
            case 'PENDING':
                pendingAmount += Number(paymentData.baseAmount) || 0;
                break;
            default:
                break;
        }
    });

    return {
        props: {
            payments,
            approvedAmount,
            cancelledAmount,
            processingAmount,
            pendingAmount,
            totalPix,
            totalCreditCard,
            event: event.eventData,
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
    totalPix,
    totalCreditCard,
    event,
}) => {
    const [displayedApprovedAmount, setDisplayedApprovedAmount] = useState(0);
    const [displayedProcessingAmount, setDisplayedProcessingAmount] =
        useState(0);
    const [displayedPendingAmount, setDisplayedPendingAmount] = useState(0);
    const [displayedCanceledAmount, setDisplayedCanceledAmount] = useState(0);

    const router = useRouter();

    const { eventId } = router.query;

    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayedApprovedAmount((current) => {
                const nextValue = current + 5;
                if (nextValue >= approvedAmount) {
                    clearInterval(interval);
                    return approvedAmount;
                }
                return nextValue;
            });
        }, 5);
        return () => clearInterval(interval);
    }, [approvedAmount]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayedProcessingAmount((current) => {
                const nextValue = current + 5;
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
            setDisplayedCanceledAmount((current) => {
                const nextValue = current + 3;
                if (nextValue >= cancelledAmount) {
                    clearInterval(interval);
                    return cancelledAmount;
                }
                return nextValue;
            });
        }, 20);
        return () => clearInterval(interval);
    }, [cancelledAmount]);

    function formatDate(timestamp: number) {
        const days = [
            'Domingo',
            'Segunda',
            'Terça',
            'Quarta',
            'Quinta',
            'Sexta',
            'Sábado',
        ];
        const months = [
            '01',
            '02',
            '03',
            '04',
            '05',
            '06',
            '07',
            '08',
            '09',
            '10',
            '11',
            '12',
        ];

        const date = new Date(timestamp);
        const dayOfWeek = days[date.getDay()];
        const day = date.getDate().toString().padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');

        return `${dayOfWeek}, ${day}/${month}/${year}, ${hour}h${minute}`;
    }

    const startDateFormatted = formatDate(event?.startDateTimestamp);
    const endDateFormatted = formatDate(event?.endDateTimestamp);

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
        id: event.id,
        slug: event.slug,
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
                                        VENDAS TOTAIS
                                    </p>
                                    <section className={styles.rowPaymentTotal}>
                                        <div>
                                            <p className={styles.valueDesc}>
                                                Total vendido nesse evento
                                            </p>
                                            <p className={styles.valueLeft}>
                                                {(
                                                    displayedApprovedAmount +
                                                    displayedProcessingAmount
                                                ).toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={styles.valueDesc}>
                                                Total líquido nesse evento
                                            </p>
                                            <p className={styles.valueRight}>
                                                {(
                                                    (displayedApprovedAmount +
                                                        displayedProcessingAmount) *
                                                        0.88 +
                                                    Number.EPSILON
                                                ).toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                })}
                                            </p>
                                        </div>
                                    </section>
                                    <section className={styles.rowPaymentTotal}>
                                        <div>
                                            <p className={styles.valueDesc}>
                                                Total vendido em PIX
                                            </p>
                                            <p className={styles.valueLeft}>
                                                {totalPix.toLocaleString(
                                                    'pt-BR',
                                                    {
                                                        style: 'currency',
                                                        currency: 'BRL',
                                                    }
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={styles.valueDesc}>
                                                Total líquido em PIX
                                            </p>
                                            <p className={styles.valueRight}>
                                                {round(
                                                    totalPix * 0.88
                                                ).toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                })}
                                            </p>
                                        </div>
                                    </section>
                                    <section className={styles.rowPaymentTotal}>
                                        <div>
                                            <p className={styles.valueDesc}>
                                                Total vendido em Cartão de
                                                Crédito
                                            </p>
                                            <p className={styles.valueLeft}>
                                                {totalCreditCard.toLocaleString(
                                                    'pt-BR',
                                                    {
                                                        style: 'currency',
                                                        currency: 'BRL',
                                                    }
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={styles.valueDesc}>
                                                Total líquido em Cartão de
                                                Crédito
                                            </p>
                                            <p className={styles.valueRight}>
                                                {round(
                                                    totalCreditCard * 0.88
                                                ).toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                })}
                                            </p>
                                        </div>
                                    </section>

                                    <button className={styles.detailButton}>
                                        DETALHES DAS VENDAS
                                    </button>
                                </div>

                                <div className={styles.rigthData}>
                                    <div className={styles.flowData}>
                                        <div>
                                            <p className={styles.resumeTitle}>
                                                VENDAS EM PROCESSAMENTO
                                                (PENDENTES)
                                            </p>
                                            <div className={styles.textRadio}>
                                                <p className={styles.flowDesc}>
                                                    Aguardando processamento de
                                                    pagamento{' '}
                                                </p>
                                                {/* <img src="/span.svg" alt="" /> */}
                                            </div>
                                        </div>

                                        <p
                                            className={
                                                styles.rightPricePendentes
                                            }
                                        >
                                            {displayedPendingAmount
                                                ? displayedPendingAmount.toLocaleString(
                                                      'pt-BR',
                                                      {
                                                          style: 'currency',
                                                          currency: 'BRL',
                                                      }
                                                  )
                                                : 'R$ 0'}
                                        </p>
                                    </div>

                                    <div className={styles.flowData}>
                                        <div>
                                            <p className={styles.resumeTitle}>
                                                VENDAS CANCELADAS
                                            </p>
                                            <div className={styles.textRadio}>
                                                <p className={styles.flowDesc}>
                                                    Pedidos cancelados ou com
                                                    cancelamento solicitado{' '}
                                                </p>
                                                {/* <img src="/span.svg" alt="" /> */}
                                            </div>
                                        </div>

                                        <p className={styles.rightPrice}>
                                            {displayedCanceledAmount
                                                ? displayedCanceledAmount.toLocaleString(
                                                      'pt-BR',
                                                      {
                                                          style: 'currency',
                                                          currency: 'BRL',
                                                      }
                                                  )
                                                : 'R$ 0'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.totalData}>
                                <p className={styles.resumeTitle}>
                                    REPASSE DO TICKET KING
                                </p>

                                <div className={styles.valuesContainer}>
                                    <div>
                                        <div className={styles.textRadio}>
                                            <p className={styles.flowDesc}>
                                                Total a receber
                                            </p>
                                            <img src="/span.svg" alt="" />
                                        </div>

                                        <p className={styles.valueLeft}>
                                            {(
                                                (displayedApprovedAmount +
                                                    displayedProcessingAmount) *
                                                    0.88 +
                                                Number.EPSILON
                                            ).toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                            })}
                                        </p>
                                    </div>

                                    <div>
                                        <div className={styles.textRadio}>
                                            <p className={styles.flowDesc}>
                                                Total recebido
                                            </p>
                                            <img src="/span.svg" alt="" />
                                        </div>

                                        <p className={styles.valueLeft}>
                                            {(0).toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                            })}
                                        </p>
                                    </div>

                                    <div>
                                        <p className={styles.valueDesc}>
                                            Nenhuma conta de repasse escolhida
                                        </p>

                                        <button className={styles.valueButton}>
                                            ESCOLHER CONTA PARA REPASSE
                                        </button>
                                    </div>
                                </div>

                                <button className={styles.detailButton}>
                                    DETALHES DO REPASSE
                                </button>
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
