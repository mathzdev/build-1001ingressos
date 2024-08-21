import Input from '@/components/Inputs/Input';
import Link from 'next/link';
import BaseModal from '../BaseModal';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { MouseEvent } from 'react';
import styles from './styles.module.scss';

export default function NewPasswordModal() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleCreateAccountClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.NewPasswordModal.close('close');
        window.SignUpModal.show();
    };

    const handleSignInClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.NewPasswordModal.close('close');
        window.SignInModal.show();
    };

    const isEventRoute = router.pathname.includes('/evento/');

    return (
        <BaseModal
            id={'NewPasswordModal'}
            title={'Digite sua nova senha'}
            subTitle="Insira sua nova senha abaixo"
            disableClosing={status !== 'authenticated' && isEventRoute}
        >
            <section className={styles.inputsWrapper}>
                <Input
                    type="password"
                    placeholder="Digite sua senha"
                    name="password"
                    required
                />
                <Input
                    type="password"
                    placeholder="Digite sua senha novamente"
                    name="repeated-password"
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
