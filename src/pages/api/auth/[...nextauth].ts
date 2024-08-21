import sanitizedEnv from '@/config/env';
import { firestoreAdmin } from '@/lib/firebase';
import { passwordMatches } from '@/utils/auth';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import NextAuth, { NextAuthOptions } from 'next-auth';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
    secret: sanitizedEnv.NEXTAUTH_SECRET, // @ts-ignore
    adapter: FirestoreAdapter(firestoreAdmin),
    providers: [
        GoogleProvider({
            clientId: sanitizedEnv.GOOGLE_AUTH_ID,
            clientSecret: sanitizedEnv.GOOGLE_AUTH_SECRET,
        }),
        AppleProvider({
            clientId: sanitizedEnv.APPLE_AUTH_ID,
            clientSecret: sanitizedEnv.APPLE_AUTH_SECRET,
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'seu@email.com.br',
                },
                password: {
                    label: 'Senha',
                    type: 'password',
                },
            },
            async authorize(credentials) {
                const { email, password, roleRequired } = credentials as {
                    email: string;
                    password: string;
                    roleRequired?: boolean;
                };

                try {
                    const querySnapshot = await firestoreAdmin
                        .collection('users')
                        .where('email', '==', email)
                        .get();

                    if (querySnapshot.empty) {
                        return null;
                    }

                    const docSnap = querySnapshot.docs[0];
                    const userRecord = docSnap.data();

                    if (
                        userRecord &&
                        (await passwordMatches(password as string, userRecord))
                    ) {
                        const allowedRoles = [
                            'X0v3WRX84lSVCK6wsRM5',
                            'xVN8VdZ5MpRnvGJRFOZ3',
                            'Fuz4gzZy95ZVoj8dJgIo',
                        ];

                        if (
                            roleRequired &&
                            !allowedRoles.includes(userRecord.roleId)
                        ) {
                            return null;
                        }

                        return {
                            id: docSnap.id,
                            email: userRecord.email,
                            emailVerified: userRecord.emailVerified,
                            name: userRecord.name,
                            phone: userRecord.phone,
                            address: userRecord.address,
                            cpf: userRecord.cpf,
                            roleId: userRecord.roleId,
                            image: userRecord.image,
                        };
                    } else {
                        return null;
                    }
                } catch (error) {
                    console.error(error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.phone = user.phone;
                token.address = user.address;
                token.cpf = user.cpf;
                token.roleId = user.roleId;
                token.image = user.image;
            }
            return token;
        },
        async session({ session, token, user }) {
            if (token) {
                session.user = {
                    id: token.id as string,
                    email: token.email as string,
                    name: token.name as string, // @ts-ignore
                    phone: token.phone, // @ts-ignore
                    address: token.address, // @ts-ignore
                    cpf: token.cpf,
                    roleId: token.roleId,
                    image: token.image,
                };
            }
            return session;
        },
    },
};

export default NextAuth(authOptions);
