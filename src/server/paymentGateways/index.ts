import AsaasPaymentGateway from './AsaasPaymentGateway';
import MercadoPagoPaymentGateway from './MercadoPagoPaymentGateway';

export type PaymentStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'AUTHORIZED'
    | 'IN_PROCESS'
    | 'IN_MEDIATION'
    | 'REJECTED'
    | 'CANCELLED'
    | 'REFUNDED'
    | 'CHARGED_BACK';

export interface Payment {
    status: PaymentStatus;
    dateCreated: Date;
    dateApproved?: Date | null;
    moneyReleaseDate?: Date | null;
    method: {
        type: 'CREDIT_CARD' | 'PIX';
        code?: string | null;
    };
    baseAmount: number;
    transactionAmount: number;
    gateway: {
        name: string;
        paymentId: string;
        customerId?: string | null;
        transactionData?: any | null;
    };
}

export interface Customer {
    customerId: string;
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    phone?: string;
}

export interface CreatePaymentDTO {
    internalId?: string;
    value: number;
    dueDate: Date;
    creditCard?: {
        holderName: string;
        number: string;
        expiryMonth: string;
        expiryYear: string;
        ccv: string;
    };
    cardHolderInfo?: {
        name: string;
        email: string;
        cpfCnpj?: string;
        postalCode?: string;
        addressNumber?: string;
        addressComplement?: string;
        phone?: string;
    };
    remoteIp?: string;
    customer: CustomerDTO;
}

export interface CustomerDTO {
    internalId?: string;
    name: string;
    cpfCnpj: string;
    email: string;
    phone?: string;
    address: {
        street: string;
        number: string;
        complement?: string;
        neighborhood?: string;
        zipCode: string;
    };
}

export interface PaymentGateway {
    usesCustomer: boolean;
    createPayment(payload: CreatePaymentDTO): Promise<Payment>;
    findOrCreateCustomer(payload: CustomerDTO): Promise<Customer>;
    getPayment(paymentId: string): Promise<Payment>;
    mapPaymentStatus(status: string): PaymentStatus;
}

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

const paymentGateways: Record<'PIX' | 'CREDIT_CARD', PaymentGateway> = {
    PIX: new MercadoPagoPaymentGateway(),
    CREDIT_CARD: new AsaasPaymentGateway(),
};

export default paymentGateways;
