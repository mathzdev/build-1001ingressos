import Button from '@/components/Button';
import ModalCreateTicket from '@/components/admin/Modals/ModalCreateTicket';
import ModalEditTicket from '@/components/admin/Modals/ModalEditTicket';
import ModalGenerateTicket from '@/components/admin/Modals/ModalGenerateTicket';
import BtnEditIcon from '@/icons/BtnEditIcon';
import AdminEventLayout from '@/layouts/AdminEventLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import { db } from '@/lib/firebaseClient';
import { NextPageWithLayout } from '@/pages/_app';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getEventById } from '@/server/db/events/getEventById';
import { BatchData } from '@/server/db/events/types';
import { PaymentStatus } from '@/server/paymentGateways';
import styles from '@/styles/ingressos/ingressos.module.scss';
import {
    DocumentReference,
    Timestamp,
    collection,
    doc,
    getDocs,
    query,
    where,
} from 'firebase/firestore';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { useRouter } from 'next/router';
import {
    ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

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

const Ingressos: NextPageWithLayout<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({
    event,
    soldTicketsCount,
    pendingTicketsCount,
    canceledTicketsCount,
}) => {
    const router = useRouter();
    const { eventId } = router.query;

    const [isGenerateTicketModalOpen, setIsGenerateTicketModalOpen] =
        useState(false);
    const [selectedBatch, setSelectedBatch] = useState<BatchData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaid, setIsPaid] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [displayedSoldTicketsCount, setDisplayedSoldTicketsCount] =
        useState(0);
    const [displayedPendingAmount, setDisplayedPendingAmount] = useState(0);
    const [displayedCanceledAmount, setDisplayedCanceledAmount] = useState(0);
    const [batches, setBatches] = useState(event.batches);

    const links = useMemo(() => {
        return [
            {
                href: `/admin/ingressos/${eventId}`,
                label: 'Ingressos',
                active: true,
            },
            {
                href: `/admin/administrar-cupons/${eventId}`,
                label: 'Códigos promocionais',
                active: false,
            },
        ];
    }, [eventId]);

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
            setDisplayedPendingAmount((current) => {
                const nextValue = current + 1;
                if (nextValue >= pendingTicketsCount) {
                    clearInterval(interval);
                    return pendingTicketsCount;
                }
                return nextValue;
            });
        }, 20);

        return () => clearInterval(interval);
    }, [pendingTicketsCount]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayedCanceledAmount((current) => {
                const nextValue = current + 1;
                if (nextValue >= canceledTicketsCount) {
                    clearInterval(interval);
                    return canceledTicketsCount;
                }
                return nextValue;
            });
        }, 20);

        return () => clearInterval(interval);
    }, [canceledTicketsCount]);

    const handleOpenModal = useCallback((type: 'PAID' | 'FREE') => {
        setIsModalOpen(true);
        setIsPaid(type === 'PAID');
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const renderActionButton = useCallback(
        (batch: BatchData) => {
            if (batch.type === 'PUBLIC') {
                return (
                    <Button
                        label="Abrir"
                        variant="admin-secondary"
                        size="small"
                        onClick={() => {
                            window.open(`/evento/${event.slug}`, '_ blank');
                        }}
                    />
                );
            } else if (batch.type === 'PRIVATE') {
                return (
                    <Button
                        label="Abrir"
                        variant="admin-secondary"
                        size="small"
                        onClick={() => {
                            window.open(
                                `/evento/${event.slug}?lote=${batch.id}`,
                                '_ blank'
                            );
                        }}
                    />
                );
            } else {
                return (
                    <Button
                        label="Gerar Ingressos"
                        variant="admin-secondary"
                        size="small"
                        onClick={() => {
                            setSelectedBatch(batch);
                            setIsGenerateTicketModalOpen(true);
                        }}
                    />
                );
            }
        },
        [event.slug]
    );

    const ref = useRef(null);
    const listRef = useRef(null);

    const transformedEvent = useMemo(
        () => ({
            id: event.id,
            slug: event.slug,
            name: event.name,
            isVisible: event.isVisible,
            startDate: event.startDateTimestamp,
            endDate: event.endDateTimestamp,
            fullAddress: `${event.address.street}, ${event.address.number}`,
        }),
        [event]
    );

    return (
        <main className={styles.container}>
            <AdminEventLayout event={transformedEvent} links={links}>
                <div className={styles.content}>
                    <div className={styles.middlecontent}>
                        <div className={styles.middletitle}>
                            <h1>INGRESSOS VENDIDOS</h1>{' '}
                        </div>

                        <div className={styles.ingressos}>
                            <div className={styles.confirmed}>
                                <img src="/people.svg" alt="" />
                                <p>Ingressos aprovados</p>
                                <h6>{displayedSoldTicketsCount}</h6>
                            </div>
                            <div className={styles.pending}>
                                {' '}
                                <img src="/people.svg" alt="" />
                                <p>Ingressos pendentes</p>
                                <h6>{displayedPendingAmount}</h6>
                            </div>
                            <div className={styles.canceled}>
                                {' '}
                                <img src="/people.svg" alt="" />
                                <p>Ingressos cancelados</p>
                                <h6>{displayedCanceledAmount}</h6>
                            </div>
                        </div>
                    </div>
                    <div className={styles.bottomcontent}>
                        <div className={styles.bottomtitle}>
                            <h1>Gerenciar Ingressos</h1>
                        </div>
                        <div className={styles.tickettype}>
                            <p>Que tipo de ingresso você deseja criar?</p>
                            <div className={styles.tickets}>
                                <div className={styles.pago}>
                                    <button
                                        onClick={() => handleOpenModal('PAID')}
                                    >
                                        <img src="/plus.svg" alt="" /> Ingresso
                                        pago
                                    </button>
                                </div>
                                <div className={styles.gratuito}>
                                    <button
                                        onClick={() => handleOpenModal('FREE')}
                                    >
                                        <img src="/plus.svg" alt="" />
                                        Ingresso Gratuito
                                    </button>
                                </div>
                                {isModalOpen && (
                                    <ModalCreateTicket
                                        handleClose={handleCloseModal}
                                        batches={batches}
                                        eventId={event.id}
                                        isPaid={isPaid}
                                        onCreate={(batch) => {
                                            setBatches((current) => [
                                                ...current.filter(
                                                    (b) => b.id !== batch.id
                                                ),
                                                batch,
                                            ]);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        <section className={styles.tableContainer} ref={ref}>
                            <header className={styles.tableHeader}>
                                <p>
                                    <b>NOME</b>
                                </p>
                                <p>
                                    <b>Ingressos disponíveis</b>
                                </p>
                                <p>
                                    <b>Tipo</b>
                                </p>
                                <p>
                                    <b>Oculto</b>
                                </p>
                                <p>
                                    <b>Ação</b>
                                </p>
                                <p>
                                    <b>Editar</b>
                                </p>
                            </header>

                            {batches.length > 0 ? (
                                batches.map((batch) => (
                                    <section
                                        className={styles.tableRow}
                                        key={batch.id}
                                    >
                                        <p>{batch.name}</p>
                                        <div>
                                            <div className={styles.progress}>
                                                <div
                                                    className={
                                                        styles.progressDone
                                                    }
                                                    style={{
                                                        opacity: 1,
                                                        width: `${
                                                            ((batch.startAmount -
                                                                batch.availableAmount) /
                                                                batch.startAmount) *
                                                            100
                                                        }%`,
                                                    }}
                                                >
                                                    <text>
                                                        {batch.startAmount -
                                                            batch.availableAmount}
                                                    </text>
                                                </div>
                                                <div
                                                    className={
                                                        styles.progressTotal
                                                    }
                                                >
                                                    {batch.startAmount}
                                                </div>
                                            </div>
                                        </div>
                                        <p>
                                            {batch.type === 'PUBLIC'
                                                ? 'Público'
                                                : batch.type === 'PRIVATE'
                                                  ? 'Restrito'
                                                  : 'Manual'}
                                        </p>
                                        <p>
                                            {!batch.isVisible ||
                                            batch.availableAmount === 0
                                                ? 'Sim'
                                                : 'Não'}
                                        </p>
                                        <div>{renderActionButton(batch)}</div>
                                        <div>
                                            <Button
                                                label=""
                                                variant="glass"
                                                size="small"
                                                icon={<BtnEditIcon />}
                                                onClick={() => {
                                                    setSelectedBatch(batch);
                                                    setIsEditModalOpen(true);
                                                }}
                                            />
                                        </div>
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
                    </div>
                </div>
                {isGenerateTicketModalOpen && selectedBatch && (
                    <ModalGenerateTicket
                        handleClose={() => {
                            setIsGenerateTicketModalOpen(false);
                        }}
                        batchData={selectedBatch}
                        eventId={event.id}
                        onCreate={(batch) => {
                            setBatches((current) => [
                                ...current.filter((b) => b.id !== batch.id),
                                batch,
                            ]);
                        }}
                    />
                )}
                {isEditModalOpen && selectedBatch && (
                    <ModalEditTicket
                        handleClose={() => {
                            setIsEditModalOpen(false);
                        }}
                        batches={batches}
                        editBatch={selectedBatch}
                        eventId={event.id}
                        onUpdate={(batch) => {
                            setBatches((current) => [
                                ...current.filter((b) => b.id !== batch.id),
                                batch,
                            ]);
                        }}
                        isPaid={selectedBatch.price > 0}
                    />
                )}
            </AdminEventLayout>
        </main>
    );
};

Ingressos.getLayout = function getLayout(page: ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default Ingressos;

export const getServerSideProps = (async (context) => {
    const { eventId } = context.params as { eventId: string };

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

    const event = await getEventById(eventId);

    let approvedAmount = 0;
    let cancelledAmount = 0;
    let processingAmount = 0;
    let pendingAmount = 0;
    let totalRelevantValue = 0;
    let relevantPaymentsCount = 0;
    let soldTicketsCount = 0;
    let pendingTicketsCount = 0;
    let canceledTicketsCount = 0;

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

        if (paymentData.status === 'PENDING') {
            pendingTicketsCount++;
        }

        if (
            paymentData.status === 'REFUNDED' ||
            paymentData.status === 'CHARGED_BACK'
        ) {
            canceledTicketsCount++;
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
            pendingTicketsCount,
            canceledTicketsCount,
        },
    };
}) satisfies GetServerSideProps;
