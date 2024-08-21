import {
    CheckoutStep,
    PaymentBase,
} from '@/pages/evento/[slug]/carrinho/[cartId]';
import { PaymentStatus } from '@/server/paymentGateways';
import { HTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface PaymentApprovedProps extends HTMLAttributes<HTMLDivElement> {
    paymentData: PaymentBase;
    onChangeStep?: (step: CheckoutStep, payload?: any) => void;
}

function formatPaymentText(status: PaymentStatus) {
    switch (status) {
        case 'APPROVED':
        case 'AUTHORIZED':
            return 'Pagamento efetuado!';
        case 'IN_PROCESS':
            return 'Processando pagamento...';
        case 'REFUNDED':
            return 'Reembolsado';
        case 'PENDING':
            return 'Pagamento pendente';
        default:
            return 'Inválido!';
    }
}

function formatPaymentStatus(status: PaymentStatus) {
    switch (status) {
        case 'APPROVED':
        case 'AUTHORIZED':
            return 'Pago';
        case 'IN_PROCESS':
            return 'Processando';
        case 'REFUNDED':
            return 'Reembolsado';
        case 'PENDING':
            return 'Pendente';
        default:
            return 'Inválido';
    }
}

function getPaymentStatusImage(status: PaymentStatus) {
    switch (status) {
        case 'APPROVED':
        case 'AUTHORIZED':
            return '/images/approvedPayment.webp';
        case 'IN_PROCESS':
            return '/images/pendingPayment.webp';
        default:
            return '/images/invalidPayment.webp';
    }
}

const PaymentApproved = ({ paymentData, ...props }: PaymentApprovedProps) => {
    return (
        <div className={styles.middleContent}>
            <div className={styles.checkedApproved}>
                <img src={getPaymentStatusImage(paymentData.status)} />
            </div>
            <div className={styles.accordionPayment}>
                <h2>{formatPaymentText(paymentData.status)}</h2>
                <div className={styles.resumoBlock}>
                    <p>Detalhes de Pagamento</p>
                    <div className={styles.rowAccordionPayment}>
                        <span>ID do Pagamento</span>
                        <p>{paymentData.id}</p>
                    </div>
                    <div className={styles.rowAccordionPayment}>
                        <span>Status do Pagamento</span>
                        <p>{formatPaymentStatus(paymentData.status)}</p>
                    </div>
                    <div className={styles.rowAccordionPayment}>
                        <span>Data do Pagamento</span>
                        <p>
                            {paymentData.dateApproved
                                ? new Date(
                                      paymentData.dateApproved
                                  ).toLocaleString('pt-BR', {
                                      dateStyle: 'short',
                                      timeStyle: 'short',
                                      timeZone: 'America/Sao_Paulo',
                                  })
                                : '-'}
                        </p>
                    </div>
                    <div className={styles.pontilhado}></div>
                    <div className={styles.totalRow}>
                        <p>Valor total</p>
                        <p>
                            {paymentData.baseAmount.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentApproved;
