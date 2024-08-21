type PaymentErrorType =
    | 'invalid_payment_data'
    | 'unauthorized'
    | 'not_found'
    | 'unknown_error';
export class PaymentError extends Error {
    type: PaymentErrorType;
    statusCode: number;
    errors?: {
        code: string;
        description: string;
    }[];

    constructor(
        message: string,
        type: PaymentErrorType,
        statusCode: number = 400,
        errors?: {
            code: string;
            description: string;
        }[],
        options?: ErrorOptions
    ) {
        super(message, options);
        this.name = 'PaymentError';
        this.type = type;
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
