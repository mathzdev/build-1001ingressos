import Button from '@/components/Button';
import Logo1001Ingressos from '@/icons/Logo1001Ingressos';
import styles from '@/styles/Login.module.scss';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import router from 'next/router';
import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const email = e.currentTarget.email.value;
        const password = e.currentTarget.password.value;
        try {
            const response = await signIn('credentials', {
                redirect: false,
                email,
                password,
                roleRequired: true,
            });

            if (response?.error) {
                toast.error('Email ou senha incorretos', {
                    icon: <>🚨</>,
                });
            } else {
                router.push('/admin/');
            }
        } catch (error) {
            console.error('Erro no processo de login:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className={styles.container}>
            <div className={styles.headerPart}>
                <Logo1001Ingressos className={styles.logo} />
                <h1>Acesse abaixo o painel para produtores</h1>
            </div>
            <div className={styles.content}>
                <form
                    id="loginAdmin"
                    className={styles.formSection}
                    onSubmit={handleSubmit}
                >
                    <div className={styles.inputBlock}>
                        <label>E-mail</label>
                        <input type="email" name="email" />
                    </div>
                    <div className={styles.inputBlock}>
                        <label>Senha</label>
                        <input type="password" name="password" />
                        <Link href="/admin/esqueceu-senha">
                            Esqueceu a senha?
                        </Link>
                    </div>
                    <Button
                        label="Entrar"
                        type="submit"
                        form="loginAdmin"
                        isLoading={isLoading}
                    />
                </form>
            </div>
        </section>
    );
}
