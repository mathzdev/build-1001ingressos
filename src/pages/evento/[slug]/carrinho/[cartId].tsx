import FillInfo from '@/components/Checkout/CheckoutSteps/FillInfo';
import PIXPaymentData from '@/components/Checkout/CheckoutSteps/PIXPaymentData';
import CardPayment from '@/components/Checkout/CheckoutSteps/Payment/CardPayment';
import PixPayment from '@/components/Checkout/CheckoutSteps/Payment/PixPayment';
import PaymentApproved from '@/components/Checkout/CheckoutSteps/PaymentApproved';
import ArrowIcon from '@/icons/ArrowIcon';
import CheckIcon from '@/icons/CheckIcon';
import { db } from '@/lib/firebaseClient';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getCartById } from '@/server/db/carts/getCartById';
import { getEventBySlug } from '@/server/db/events/getEventBySlug';
import { BatchData } from '@/server/db/events/types';
import { PaymentStatus } from '@/server/paymentGateways';
import styles from '@/styles/Pagar.module.scss';
import { DocumentReference, doc, getDoc } from 'firebase/firestore';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { useRouter } from 'next/router';
import { MouseEvent, useEffect, useState } from 'react';

export type CheckoutStep =
    | 'fill_info'
    | 'payment_method'
    | 'processing_payment'
    | 'payment_approved';

export const getServerSideProps = (async (context) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    );

    const { cartId } = context.params as {
        slug: string;
        cartId: string;
    };

    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    try {
        const { slug, batches, couponId, reservationDate, payment } =
            await getCartById(session.user.id, cartId);

        const event = await getEventBySlug(slug);

        let totalPrice = batches.reduce(
            (acc, batch) => acc + batch.price * batch.selectedAmount,
            0
        );

        let couponData: {
            isActive: boolean;
            discount: number;
            type: 'percent' | 'fixed';
        } | null = null;

        if (couponId) {
            const couponDoc = doc(db, 'events', cartId, 'coupons', couponId);

            const couponSnapshot = await getDoc(couponDoc);

            if (couponSnapshot.exists()) {
                couponData = couponSnapshot.data() as {
                    isActive: boolean;
                    discount: number;
                    type: 'percent' | 'fixed';
                };
                if (couponData.isActive) {
                    if (couponData.type === 'percent') {
                        totalPrice *= 1 - couponData.discount / 100;
                    } else {
                        totalPrice -= couponData.discount;
                    }
                    if (totalPrice < 0) {
                        totalPrice = 0;
                    }
                }
            }
        }

        const paymentData: PaymentBase | null = payment
            ? {
                  id: payment.id,
                  status: payment.status,
                  dateApproved: payment.dateApproved,
                  dateCreated: payment.dateCreated,
                  baseAmount: payment.baseAmount,
                  gateway: payment.gateway,
                  method: payment.method,
              }
            : null;

        return {
            props: {
                slug,
                cartId,
                reservationDate,
                couponData,
                batches,
                totalPrice,
                payment: paymentData,
                eventName: event.eventData.name,
                eventDate: event.eventData.startDateTimestamp,
                organizerName: event.organizerData.name,
            },
        };
    } catch (error) {
        console.error('Erro ao buscar evento:', error);

        return {
            notFound: true,
        };
    }
}) satisfies GetServerSideProps<{
    slug: string;
    cartId: string;
    reservationDate: string;
    couponData: {
        isActive: boolean;
        discount: number;
        type: 'percent' | 'fixed';
    } | null;
    batches: (BatchData & { selectedAmount: number })[];
    totalPrice: number;
}>;

export interface PaymentData {
    id: string;
    status: PaymentStatus;
    dateApproved: string | null;
    dateCreated: string;
    ticketsId: Array<DocumentReference>;
    eventId: DocumentReference;
    userId: DocumentReference;
    baseAmount: number;
    gateway: {
        name: string;
        paymentId: string;
        customerId?: string;
        transactionData?: any;
    };
    method: {
        code: string;
        type: 'CREDIT_CARD' | 'PIX';
    };
}

export type PaymentBase = Omit<PaymentData, 'userId' | 'eventId' | 'ticketsId'>;

export default function Carrinho({
    slug,
    cartId,
    batches,
    totalPrice,
    payment,
    eventName,
    eventDate,
    organizerName,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [activeStep, setActiveStep] = useState<CheckoutStep>(
        payment ? 'processing_payment' : 'fill_info'
    );
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
        'CREDIT_CARD' | 'PIX'
    >(payment ? payment.method.type : 'PIX');
    const [paymentData, setPaymentData] = useState<PaymentBase | null>(payment);
    const router = useRouter();

    useEffect(() => {
        if (payment) {
            setPaymentData(payment);
            setSelectedPaymentMethod(payment.method.type);
            if (
                payment.status === 'APPROVED' ||
                payment.status === 'AUTHORIZED'
            ) {
                setActiveStep('payment_approved');
            } else {
                setActiveStep('processing_payment');
            }
        }
    }, [payment]);

    const handleStepChange = (step: CheckoutStep, payload?: any) => {
        let newStep = step;
        if (step === 'processing_payment') {
            if (payload) {
                setPaymentData(payload);
                if (
                    payload.status === 'APPROVED' ||
                    payload.status === 'AUTHORIZED'
                ) {
                    newStep = 'payment_approved';
                }
            }
        }
        setActiveStep(newStep);
    };

    const handlePaymentMethodSelect = (method: 'CREDIT_CARD' | 'PIX') => {
        setSelectedPaymentMethod(method);
    };

    const handleGoBack = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        switch (activeStep) {
            case 'payment_method':
                handleStepChange('fill_info');
                break;
            default:
                router.push(`/evento/${slug}`);
                break;
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);

        return date.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formattedEventDate = formatDate(eventDate);

    return (
        <section className={styles.container}>
            <div className={styles.content}>
                <header
                    className={styles.checkoutHeader}
                    data-active-step={activeStep}
                >
                    <div className={styles.row1}>
                        <button onClick={handleGoBack}>
                            <ArrowIcon />
                        </button>
                        <h6>Método de pagamento</h6>
                    </div>
                    <div className={styles.steps}>
                        <div className={styles.circle}>
                            <CheckIcon />
                        </div>
                        <div className={styles.line} />
                        <div className={styles.circle}>
                            <CheckIcon />
                        </div>
                        <div className={styles.line} />
                        <div className={styles.circle}>
                            <CheckIcon />
                        </div>
                    </div>
                </header>
                <main className={styles.stepsContainer}>
                    <FillInfo
                        className={styles.stepContent}
                        data-is-active={activeStep === 'fill_info'}
                        batches={batches}
                        totalPrice={totalPrice}
                        onChangeStep={handleStepChange}
                        selectedPaymentMethod={selectedPaymentMethod}
                        onSelectedPaymentMethodChange={
                            handlePaymentMethodSelect
                        }
                        eventName={eventName}
                        formattedEventDate={formattedEventDate}
                        organizerName={organizerName}
                    />

                    {selectedPaymentMethod === 'PIX' ? (
                        <PixPayment
                            cartId={cartId}
                            className={styles.stepContent}
                            data-is-active={activeStep === 'payment_method'}
                            onChangeStep={handleStepChange}
                        />
                    ) : (
                        <CardPayment
                            cartId={cartId}
                            className={styles.stepContent}
                            data-is-active={activeStep === 'payment_method'}
                            onChangeStep={handleStepChange}
                        />
                    )}

                    {paymentData &&
                        (selectedPaymentMethod === 'PIX' ? (
                            <PIXPaymentData
                                paymentData={paymentData}
                                className={styles.stepContent}
                                data-is-active={
                                    activeStep === 'processing_payment' ||
                                    activeStep === 'payment_approved'
                                }
                                onChangeStep={handleStepChange}
                            />
                        ) : (
                            <PaymentApproved
                                paymentData={paymentData}
                                className={styles.stepContent}
                                data-is-active={
                                    activeStep === 'processing_payment' ||
                                    activeStep === 'payment_approved'
                                }
                                onChangeStep={handleStepChange}
                            />
                        ))}
                </main>
            </div>
        </section>
    );
}
