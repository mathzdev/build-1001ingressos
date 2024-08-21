import Input from '@/components/Inputs/Input';
import Link from 'next/link';
import BaseModal from '../BaseModal';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { MouseEvent } from 'react';
import styles from './styles.module.scss';

export default function ForgotPasswordModal() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleCreateAccountClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.ForgotPasswordModal.close('close');
        window.SignUpModal.show();
    };

    const handleSignInClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.ForgotPasswordModal.close('close');
        window.SignInModal.show();
    };

    const isEventRoute = router.pathname.includes('/evento/');

    return (
        <BaseModal
            id={'ForgotPasswordModal'}
            title={'Esqueceu sua senha?'}
            subTitle="Insira seu e-mail abaixo para recuperar sua senha"
            disableClosing={status !== 'authenticated' && isEventRoute}
        >
            <section className={styles.inputsWrapper}>
                <Input
                    type="email"
                    placeholder="Digite seu email"
                    name="email"
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
                    <Link href="#" onClick={handleSignInClick}>
                        Fazer login
                    </Link>
                </section>
            </div>
        </BaseModal>
    );
}
