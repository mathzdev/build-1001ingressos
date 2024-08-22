import Button from '@/components/Button';
import styles from '@/styles/Login.module.scss';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function Home() {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleCredentialsAuthentication = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const { email, password } = Object.fromEntries(formData.entries());

        const response = await signIn('credentials', {
            email: email,
            password: password,
            redirect: false,
        });
    };

    const handleGoogleAuthentication = async () => {
        const response = await signIn('google');
    };

    const handleAppleAuthentication = async () => {
        const response = await signIn('apple');
    };

    return (
        <main className={styles.container}>
            <div className={styles.titleblock}>
                <h1>Bem vindo a 1001 Ingressos</h1>
                <p>Faça seu login para continuar</p>
            </div>
            <div className={styles.formBlock}>
                <form onSubmit={handleCredentialsAuthentication}>
                    <div className={styles.flexInput}>
                        <img src="/email.svg" />
                        <input name="email" placeholder="Email" type="email" />
                    </div>
                    <div className={styles.flexInput}>
                        <img src="/padlock.svg" />
                        <input
                            name="password"
                            placeholder="Senha"
                            type={passwordVisible ? 'text' : 'password'}
                        />
                        <img
                            src={
                                passwordVisible
                                    ? '/openEye.svg'
                                    : '/closedEye.svg'
                            }
                            onClick={togglePasswordVisibility}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                    <Button label="Entrar" type="submit" />
                </form>
            </div>
            <div className={styles.footer}>
                <div className={styles.lineFlex}>
                    <hr />
                    <p>Ou entre usando</p>
                    <hr />
                </div>
                <div className={styles.loginOptionsBlock}>
                    <Button
                        label="Google"
                        icon={<img src="/googleProvider.svg" />}
                        onClick={handleGoogleAuthentication}
                        variant="glass"
                        type="button"
                    />
                    {/* <Button
                        label="Apple"
                        icon={<img src="/appleProvider.svg" />}
                        onClick={handleAppleAuthentication}
                        variant="glass"
                    /> */}
                </div>
                <div className={styles.singUp}>
                    <p>Esqueceu sua senha?</p>
                    <p>
                        Não tem uma conta?
                        <Link href="/create"> Cadastre-se</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
