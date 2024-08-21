import Button from '@/components/Button';
import Input from '@/components/Inputs/Input';
import Link from 'next/link';
import BaseModal from '../BaseModal';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FormEvent, MouseEvent } from 'react';
import { toast } from 'react-toastify';
import styles from './styles.module.scss';

interface SignInModalProps {
    onSuccess?: () => void;
}

export default function SignInModal({ onSuccess }: SignInModalProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleCreateAccountClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.SignInModal.close('close');
        window.SignUpModal.show();
    };

    const handleForgotPasswordClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.SignInModal.close('close');
        window.ForgotPasswordModal.show();
    };

    const handleCredentialsAuthentication = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const { email, password } = Object.fromEntries(formData.entries());

        try {
            const response = await signIn('credentials', {
                email: email,
                password: password,
                redirect: false,
            });

            if (response?.error) {
                throw new Error('Error');
            }

            onSuccess?.();

            window.SignInModal.close('close');
        } catch (error) {
            toast.error('Email ou senha incorretos', {
                icon: '🚨',
            });
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
            id={'SignInModal'}
            title={'Bem vindo à Ticket King'}
            subTitle="Faça seu login para continuar"
            onSubmit={handleCredentialsAuthentication}
            disableClosing={status !== 'authenticated' && isEventRoute}
        >
            <section className={styles.inputsWrapper}>
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
            </section>
            <div>
                <section className={styles.linksWrapper}>
                    <Link
                        href="#"
                        className={styles.createAccount}
                        onClick={handleCreateAccountClick}
                    >
                        Criar Conta
                    </Link>
                    <Link href="#" onClick={handleForgotPasswordClick}>
                        Esqueceu sua senha?
                    </Link>
                </section>
                <div className={styles.divider}>Ou entre usando</div>
                <section className={styles.socialLoginWrapper}>
                    <Button
                        label="Google"
                        variant="glass"
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
                        size="small"
                        icon={<AppleIcon />}
                        onClick={handleAppleAuthentication}
                    /> */}
                </section>
            </div>
        </BaseModal>
    );
}
