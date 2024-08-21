import sanitizedEnv from '@/config/env';
import { ensureError } from '@/utils/error';
import { AsaasClient } from 'asaas';
import { isAxiosError } from 'axios';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
    CreatePaymentDTO,
    Customer,
    CustomerDTO,
    Payment,
    PaymentGateway,
    PaymentStatus,
} from '.';
import { PaymentError } from './error';

class AsaasPaymentGateway implements PaymentGateway {
    #client: AsaasClient;

    usesCustomer = true;

    constructor() {
        dayjs.extend(utc);
        dayjs.extend(timezone);

        this.#client = new AsaasClient(sanitizedEnv.ASAAS_API_KEY, {
            sandbox: sanitizedEnv.ASAAS_API_MODE === 'SANDBOX',
        });
    }

    public async createPayment({
        internalId,
        value,
        dueDate,
        creditCard,
        cardHolderInfo,
        remoteIp,
        customer,
    }: CreatePaymentDTO): Promise<Payment> {
        try {
            const paymentCustomer = await this.findOrCreateCustomer(customer);

            const payment = await this.#client.payments.new({
                customer: paymentCustomer.customerId,
                billingType: 'CREDIT_CARD',
                value,
                dueDate,
                creditCard,
                creditCardHolderInfo: cardHolderInfo as any,
                remoteIp,
                externalReference: internalId,
            });

            if (payment.id === undefined || payment.id === null) {
                throw new Error('Payment ID is undefined');
            }

            return {
                status: payment.status
                    ? this.mapPaymentStatus(payment.status)
                    : 'PENDING',
                dateCreated: payment.dateCreated
                    ? dayjs(payment.dateCreated)
                          .tz('America/Sao_Paulo', true)
                          .toDate()
                    : new Date(),
                dateApproved: payment.confirmedDate
                    ? dayjs(payment.confirmedDate)
                          .tz('America/Sao_Paulo', true)
                          .toDate()
                    : null,
                method: {
                    type: 'CREDIT_CARD',
                    code: payment.creditCard?.creditCardBrand ?? '',
                },
                baseAmount: payment.value ?? 0,
                transactionAmount: payment.netValue ?? 0,
                gateway: {
                    name: 'Asaas',
                    paymentId: payment.id,
                    customerId: paymentCustomer.customerId,
                },
            };
        } catch (err) {
            const error = ensureError(err);

            if (isAxiosError(error)) {
                if (error.status === 400) {
                    throw new PaymentError(
                        error.response?.data?.errors[0].description ??
                            'Invalid payment data',
                        'invalid_payment_data',
                        400,
                        error.response?.data.errors,
                        {
                            cause: error,
                        }
                    );
                } else if (error.status === 401) {
                    throw new PaymentError(
                        'Invalid Asaas API key',
                        'unauthorized',
                        403,
                        error.response?.data.errors,
                        {
                            cause: error,
                        }
                    );
                } else if (error.status === 404) {
                    throw new PaymentError(
                        'Asaas API endpoint not found',
                        'not_found',
                        404,
                        error.response?.data.errors,
                        {
                            cause: error,
                        }
                    );
                } else {
                    throw new PaymentError(
                        'Unknown error occurred while creating the payment',
                        'unknown_error',
                        500,
                        error.response?.data.errors,
                        {
                            cause: error,
                        }
                    );
                }
            }

            throw new PaymentError(
                'Unknown error occurred while creating the payment',
                'unknown_error',
                500,
                [
                    {
                        code: 'unknown_error',
                        description: error.message,
                    },
                ],
                {
                    cause: err,
                }
            );
        }
    }

    public async findOrCreateCustomer({
        internalId,
        name,
        cpfCnpj,
        email,
        phone,
        address,
    }: CustomerDTO): Promise<Customer> {
        const existingCustomer = await this.#client.customers.list({
            limit: 1,
            cpfCnpj,
            externalReference: internalId,
        });

        if (existingCustomer.totalCount > 0) {
            const customerData = existingCustomer.data[0];
            return {
                customerId: customerData.id,
                name: customerData.name!,
                email: customerData.email!,
                cpfCnpj: customerData.cpfCnpj!,
                postalCode: customerData.postalCode!,
                addressNumber: customerData.addressNumber!,
                addressComplement: customerData.complement,
                phone: customerData.phone,
            };
        }

        const newCustomer = await this.#client.customers.new({
            name,
            cpfCnpj,
            email,
            phone,
            address: address.street,
            addressNumber: address.number,
            complement: address.complement,
            province: address.neighborhood,
            postalCode: address.zipCode,
            externalReference: internalId,
        });

        return {
            customerId: newCustomer.id,
            name: newCustomer.name!,
            email: newCustomer.email!,
            cpfCnpj: newCustomer.cpfCnpj!,
            postalCode: newCustomer.postalCode!,
            addressNumber: newCustomer.addressNumber!,
            addressComplement: newCustomer.complement,
            phone: newCustomer.phone,
        };
    }

    public async getPayment(paymentId: string): Promise<Payment> {
        const payment = await this.#client.payments.getById(paymentId);

        if (payment.id === undefined || payment.id === null) {
            throw new Error('Payment ID is undefined');
        }

        return {
            status: payment.status
                ? this.mapPaymentStatus(payment.status)
                : 'PENDING',
            dateCreated: payment.dateCreated
                ? dayjs(payment.dateCreated)
                      .tz('America/Sao_Paulo', true)
                      .toDate()
                : new Date(),
            dateApproved: payment.confirmedDate
                ? dayjs(payment.confirmedDate)
                      .tz('America/Sao_Paulo', true)
                      .toDate()
                : null,
            method: {
                type: 'CREDIT_CARD',
                code: payment.creditCard?.creditCardBrand ?? '',
            },
            baseAmount: payment.value ?? 0,
            transactionAmount: payment.netValue ?? 0,
            gateway: {
                name: 'Asaas',
                paymentId: payment.id,
                customerId: payment.customer!,
            },
        };
    }

    mapPaymentStatus(status: string): PaymentStatus {
        switch (status) {
            case 'PENDING':
                return 'PENDING';
            case 'RECEIVED':
                return 'APPROVED';
            case 'CONFIRMED':
                return 'AUTHORIZED';
            case 'OVERDUE':
                return 'CANCELLED';
            case 'REFUNDED':
                return 'REFUNDED';
            case 'RECEIVED_IN_CASH':
                return 'APPROVED';
            case 'REFUND_REQUESTED':
            case 'REFUND_IN_PROGRESS':
            case 'CHARGEBACK_REQUESTED':
            case 'CHARGEBACK_DISPUTE':
            case 'AWAITING_CHARGEBACK_REVERSAL':
            case 'DUNNING_REQUESTED':
                return 'IN_MEDIATION';
            case 'DUNNING_RECEIVED':
                return 'APPROVED';
            case 'AWAITING_RISK_ANALYSIS':
                return 'PENDING';
            default:
                return 'PENDING';
        }
    }
}

export default AsaasPaymentGateway;
