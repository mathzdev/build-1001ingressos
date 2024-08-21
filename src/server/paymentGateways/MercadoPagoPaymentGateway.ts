import sanitizedEnv from '@/config/env';
import { ensureError } from '@/utils/error';
import { formatExpirationDate } from '@/utils/format/date';
import { Payment as MBPayment, MercadoPagoConfig } from 'mercadopago';
import {
    CreatePaymentDTO,
    Customer,
    CustomerDTO,
    MINUTE,
    Payment,
    PaymentGateway,
    PaymentStatus,
} from '.';
import { PaymentError } from './error';

interface MBErrorResponse {
    message: string;
    error: string;
    status: number;
    cause: Array<{
        code: number;
        description: string;
        data: string;
    }>;
}

class MercadoPagoPaymentGateway implements PaymentGateway {
    #config: MercadoPagoConfig;
    #client: MBPayment;

    usesCustomer = false;

    constructor() {
        this.#config = new MercadoPagoConfig({
            accessToken: sanitizedEnv.MP_ACCESS_TOKEN,
        });
        this.#client = new MBPayment(this.#config);
    }

    public async createPayment({
        internalId,
        value,
        remoteIp,
        customer,
    }: CreatePaymentDTO): Promise<Payment> {
        try {
            const [customerName, ...customerLastName] =
                customer.name.split(' ');
            const payerBasicInfo = {
                first_name: customerName,
                last_name: customerLastName.join(' '),
                address: {
                    street_name: customer.address.street,
                    street_number: Number(customer.address.number),
                    zip_code: customer.address.zipCode,
                },
            };

            const payer = {
                id: customer.internalId,
                email: customer.email,
                type: 'customer',
                identification: {
                    type: 'CPF',
                    number: customer.cpfCnpj,
                },
                ...payerBasicInfo,
            };

            const phone = customer.phone
                ? {
                      area_code: customer.phone.substring(0, 2),
                      number: customer.phone.substring(2),
                  }
                : undefined;

            const payment = await this.#client.create({
                body: {
                    transaction_amount: value,
                    payment_method_id: 'pix',
                    payer,
                    additional_info: {
                        ip_address: remoteIp,
                        payer: {
                            phone,
                            ...payerBasicInfo,
                        },
                    },
                    external_reference: internalId,
                    date_of_expiration: formatExpirationDate(
                        new Date(Date.now() + 30 * MINUTE)
                    ),
                },
            });

            return {
                status: payment.status
                    ? this.mapPaymentStatus(payment.status)
                    : 'PENDING',
                dateCreated: payment.date_created
                    ? new Date(payment.date_created)
                    : new Date(),
                dateApproved: payment.date_approved
                    ? new Date(payment.date_approved)
                    : null,
                method: {
                    type: 'PIX',
                    code: payment.payment_method_id ?? 'PIX',
                },
                baseAmount: payment.transaction_amount ?? 0,
                transactionAmount:
                    payment.transaction_details?.net_received_amount ?? 0,
                gateway: {
                    name: 'MercadoPago',
                    paymentId: String(payment.id ?? ''),
                    customerId: payment.payer?.id ?? '',
                    transactionData:
                        payment.point_of_interaction?.transaction_data,
                },
            };
        } catch (err) {
            if (!(err instanceof Error)) {
                const error = err as MBErrorResponse;

                if (error.status === 400) {
                    throw new PaymentError(
                        error.message,
                        'invalid_payment_data',
                        400,
                        error.cause.map((cause) => ({
                            code: cause.code.toString(),
                            description: cause.description,
                        })),
                        {
                            cause: err,
                        }
                    );
                } else if (error.status === 403) {
                    throw new PaymentError(
                        error.message,
                        'unauthorized',
                        403,
                        error.cause.map((cause) => ({
                            code: cause.code.toString(),
                            description: cause.description,
                        })),
                        {
                            cause: err,
                        }
                    );
                } else if (error.status === 404) {
                    throw new PaymentError(
                        error.message,
                        'not_found',
                        404,
                        error.cause.map((cause) => ({
                            code: cause.code.toString(),
                            description: cause.description,
                        })),
                        {
                            cause: err,
                        }
                    );
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
            } else {
                const error = ensureError(err);

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
    }

    public async findOrCreateCustomer(payload: CustomerDTO): Promise<Customer> {
        throw new Error('Unused method');
    }

    public async getPayment(paymentId: string): Promise<Payment> {
        const payment = await this.#client.get({
            id: paymentId,
        });

        return {
            status: payment.status
                ? this.mapPaymentStatus(payment.status)
                : 'PENDING',
            dateCreated: payment.date_created
                ? new Date(payment.date_created)
                : new Date(),
            dateApproved: payment.date_approved
                ? new Date(payment.date_approved)
                : null,
            method: {
                type: 'PIX',
                code: payment.payment_method_id ?? 'PIX',
            },
            baseAmount: payment.transaction_amount ?? 0,
            transactionAmount:
                payment.transaction_details?.net_received_amount ?? 0,
            gateway: {
                name: 'MercadoPago',
                paymentId: String(payment.id ?? ''),
                customerId: payment.payer?.id ?? '',
            },
        };
    }

    public mapPaymentStatus(status: string): PaymentStatus {
        switch (status) {
            default:
                return status.toLocaleUpperCase() as PaymentStatus;
        }
    }
}

export default MercadoPagoPaymentGateway;
