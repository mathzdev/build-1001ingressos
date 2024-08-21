export * from 'asaas';

declare module 'asaas' {
    export interface IAsaasPaymentResponse {
        dateCreated?: string;
        dueDate?: string;
        confirmedDate?: string;
        originalDueDate?: string;
    }
}
