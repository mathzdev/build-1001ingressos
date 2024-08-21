import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface User {
        id: string;
        name: string;
        email: string;
        cpf?: string;
        phone?: string;
        address?: {
            street: string;
            number: number;
            complement?: string;
            neighborhood?: string;
            postalCode: string;
        };
        roleId?: string;
        image?: string;
    }

    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            cpf?: string;
            phone?: string;
            address?: {
                street: string;
                number: number;
                complement?: string;
                neighborhood?: string;
                postalCode: string;
            };
            roleId?: string;
            image?: string;
        };
        expires: DefaultSession['expires'];
    }
}

declare module 'next-auth/jwt' {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        cpf?: string | null;
        phone?: string | null;
        address?: {
            street: string;
            number: number;
            complement?: string;
            neighborhood?: string;
            postalCode: string;
        } | null;
        roleId?: string;
        image?: string;
    }
}
