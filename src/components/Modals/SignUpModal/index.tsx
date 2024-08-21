import Button from '@/components/Button';
import Input from '@/components/Inputs/Input';
import BaseModal from '../BaseModal';

import MaskedInput from '@/components/Inputs/MaskedInput';
import axios from 'axios';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, MouseEvent, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './styles.module.scss';

interface SignUpModalProps {
    onSuccess?: () => void;
}

export default function SignUpModal({ onSuccess }: SignUpModalProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignInClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.SignUpModal.close('close');
        window.SignInModal.show();
    };

    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const { name, email, password, confirmPassword, phone } =
            Object.fromEntries(formData.entries());

        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem', {
                icon: '🚨',
            });
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            await axios.post('/api/users/createUser', {
                name,
                email,
                password,
                phone,
            });

            toast.success('Conta criada com sucesso!', {
                icon: '🎉',
            });
            setIsLoading(false);

            await handleCredentialsAuthentication(
                email.toString(),
                password.toString()
            );

            onSuccess?.();

            window.SignUpModal.close('close');
            window.SignInModal.show();
        } catch (error: any) {
            if (error.response && error.response.data) {
                toast.error(error.response.data.message, {
                    icon: '🚨',
                });
                setIsLoading(false);
                return;
            }
            toast.error(
                'Ocorreu um erro ao criar a conta, tente novamente mais tarde!',
                {
                    icon: '🚨',
                }
            );
            console.error('Erro na criação da conta:', error);
        }
    };

    const handleCredentialsAuthentication = async (
        email: string,
        password: string
    ) => {
        try {
            const response = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (response?.error) {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleGoogleAuthentication = async () => {
        try {
            const response = await signIn('google', {
                redirect: false,
            });

            if (response?.error) {
                throw new Error(response.error);
            }

            onSuccess?.();

            window.SignInModal.close('close');
        } catch (error) {
            toast.error('Email ou senha incorretos', {
                icon: '🚨',
            });
        }
    };

    const handleAppleAuthentication = async () => {
        try {
            const response = await signIn('apple', {
                redirect: false,
            });

            if (response?.error) {
                throw new Error(response.error);
            }

            onSuccess?.();

            window.SignInModal.close('close');
        } catch (error) {
            toast.error('Email ou senha incorretos', {
                icon: '🚨',
            });
        }
    };

    const isEventRoute = router.pathname.includes('/evento/');

    return (
        <BaseModal
            id={'SignUpModal'}
            title={'Bem vindo à Ticket King'}
            subTitle="Insira seus dados para continuar"
            submitLabel="Criar conta"
            onSubmit={handleFormSubmit}
            submitIsLoading={isLoading}
            disableClosing={status !== 'authenticated' && isEventRoute}
        >
            <section className={styles.inputsWrapper}>
                <Input
                    type="text"
                    placeholder="Digite seu nome"
                    name="name"
                    required
                />
                <Input
                    type="email"
                    placeholder="Digite seu email"
                    name="email"
                    required
                />
                <Input
                    type="password"
                    placeholder="Digite sua senha"
                    name="password"
                    required
                />
                <Input
                    type="password"
                    placeholder="Digite sua senha novamente"
                    name="confirmPassword"
                    required
                />
                <MaskedInput
                    type="tel"
                    placeholder="Digite seu telefone"
                    name="phone"
                    pattern="\d*"
                    required
                    mask={[
                        {
                            mask: '(00) 0000-0000',
                            max: 10,
                        },
                        {
                            mask: '(00) 00000-0000',
                        },
                    ]}
                />
            </section>
            <div>
                <section className={styles.linksWrapper}>
                    <p>Já possui conta?</p>
                    <Link
                        href="#"
                        className={styles.createAccount}
                        onClick={handleSignInClick}
                    >
                        Fazer Login
                    </Link>
                </section>
                <div className={styles.divider}>Ou entre usando</div>
                <section className={styles.socialLoginWrapper}>
                    <Button
                        label="Google"
                        variant="glass"
                        hideLoading
                        size="small"
                        icon={
                            <img
                                src="/images/google-icon.png"
                                alt="Google Login"
                            />
                        }
                        onClick={handleGoogleAuthentication}
                    />
                    {/* <Button
                        label="Apple"
                        variant="glass"
                        hideLoading
                        size="small"
                        icon={<AppleIcon />}
                        onClick={handleAppleAuthentication}
                    /> */}
                </section>
            </div>
        </BaseModal>
    );
}
