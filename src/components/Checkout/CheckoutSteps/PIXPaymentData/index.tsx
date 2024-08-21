import Button from '@/components/Button';
import CheckWhite from '@/icons/CheckWhite';
import MobileIcon from '@/icons/MobileIcon';
import QrIcon from '@/icons/QrIcon';
import {
    CheckoutStep,
    PaymentBase,
} from '@/pages/evento/[slug]/carrinho/[cartId]';
import { PaymentStatus } from '@/server/paymentGateways';
import { HTMLAttributes, MouseEvent } from 'react';
import styles from './styles.module.scss';

interface PIXPaymentDataProps extends HTMLAttributes<HTMLDivElement> {
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
        case 'PENDING':
        case 'IN_PROCESS':
            return '/images/processingPayment.webp';
        default:
            return '/images/invalidPayment.webp';
    }
}

const PIXPaymentData = ({ paymentData, ...props }: PIXPaymentDataProps) => {
    function handleCopyCode(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        navigator.clipboard.writeText(
            paymentData.gateway.transactionData?.qr_code
        );
    }

    return (
        <div className={styles.middleContent}>
            <div className={styles.checkedApproved}>
                <img src={getPaymentStatusImage(paymentData.status)} />
            </div>
            <div className={styles.accordionPayment}>
                <h2>{formatPaymentText(paymentData.status)}</h2>
                <div className={styles.rowPayment}>
                    <div className={styles.resumoBlockFirstBlock}>
                        <p>Dados para o Pagamento via PIX</p>
                        <div className={styles.pixQRCode}>
                            <img
                                src={`data:image/png;base64,${paymentData.gateway.transactionData?.qr_code_base64}`}
                            />
                        </div>
                        <Button
                            onClick={handleCopyCode}
                            label="Copiar código"
                            size="small"
                        />
                    </div>
                    <div className={styles.comoPagarDesktop}>
                        <h4>Como pagar?</h4>
                        <div className={styles.rowIconInformation}>
                            <MobileIcon />
                            <p>
                                Abra o app do seu banco ou carteira digital e
                                <strong>escolha pagar com Pix</strong>
                            </p>
                        </div>
                        <div className={styles.rowIconInformation}>
                            <QrIcon />
                            <p>
                                Selecione a opção{' '}
                                <strong>
                                    pagar com QR Code e escaneie o código
                                </strong>{' '}
                                ao lado ou{' '}
                                <strong>
                                    copie o código e selecione a opção Pix Copia
                                    e Cola..
                                </strong>
                            </p>
                        </div>
                        <div className={styles.rowIconInformation}>
                            <CheckWhite />
                            <p>Confirme as informações e finalize a compra</p>
                        </div>
                    </div>
                </div>
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

export default PIXPaymentData;
