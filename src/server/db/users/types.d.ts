export interface UserData {
    cpf?: string;
    name: string;
    phone: string;
    password?: string;
    email: string;
    emailVerified: boolean | null;
    address?: {
        street: string;
        number: number;
        postalCode: string;
        complement?: string;
    };

    roleId?: string;
    image?: string;
}
