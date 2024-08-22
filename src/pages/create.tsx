import Button from '@/components/Button';
import styles from '@/styles/Create.module.scss';
import axios from 'axios';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChangeEvent, FormEvent, useState } from 'react';
import ReactPasswordChecklist from 'react-password-checklist';
import { toast } from 'react-toastify';

function PhoneInput({ placeholder }: any) {
    const [value, setValue] = useState('');

    const handleInputChange = (e: any) => {
        let inputValue = e.target.value;

        inputValue = inputValue.replace(/\D/g, '');

        if (inputValue.length <= 2) {
            inputValue = `(${inputValue}`;
        } else if (inputValue.length <= 7) {
            inputValue = `(${inputValue.substring(
                0,
                2
            )}) ${inputValue.substring(2)}`;
        } else {
            inputValue = `(${inputValue.substring(
                0,
                2
            )}) ${inputValue.substring(2, 7)}-${inputValue.substring(7)}`;
        }

        if (inputValue.length > 15) {
            inputValue = inputValue.substring(0, 15);
        }

        setValue(inputValue);
    };

    return (
        <input
            type="text"
            value={value}
            name="phone"
            accept="\d*"
            onChange={handleInputChange}
            placeholder={placeholder}
        />
    );
}

export default function Create() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const router = useRouter();

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
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

            router.push('/');
        } catch (error: any) {
            if (error.response && error.response.data) {
                console.log(error.response);

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

    const handleGoogleAuthentication = async () => {
        const response = await signIn('google');
    };

    const handleAppleAuthentication = async () => {
        const response = await signIn('apple');
    };

    return (
        <section className={styles.container}>
            <div className={styles.titleblock}>
                <h1>Bem vindo a 1001 Ingressos</h1>
                <p>Para começar preencha o formulário de cadastro</p>
            </div>
            <div className={styles.formBlock}>
                <form onSubmit={handleFormSubmit}>
                    <div className={styles.flexInput}>
                        <input placeholder="Nome" type="text" name="name" />
                    </div>
                    <div className={styles.flexInput}>
                        <img src="/email.svg" />
                        <input placeholder="Email" type="email" name="email" />
                    </div>
                    <div className={styles.flexInput}>
                        <img src="/padlock.svg" />
                        <input
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="Senha"
                            type="password"
                            name="password"
                        />
                    </div>
                    <div className={styles.flexInput}>
                        <img src="/padlock.svg" />
                        <input
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            placeholder="Re-escreva"
                            type="password"
                            name="confirmPassword"
                        />
                    </div>
                    <div className={styles.flexInput}>
                        <img sr-c="/phone.svg" />
                        <PhoneInput placeholder="Número de celular" />
                    </div>
                    <ReactPasswordChecklist
                        rules={[
                            'minLength',
                            'specialChar',
                            'number',
                            'capital',
                            'match',
                        ]}
                        value={password}
                        valueAgain={confirmPassword}
                        minLength={8}
                        onChange={(isValid) => setIsPasswordValid(isValid)}
                        messages={{
                            minLength: 'A senha possui mais de 8 caracteres.',
                            specialChar: 'A senha possui caracteres especiais.',
                            number: 'A senha possui um número.',
                            lowercase: 'A senha possui uma letra minúscula.',
                            capital: 'A senha possui uma letra maiúscula.',
                            match: 'As senhas coincidem',
                        }}
                    />
                    <Button
                        label="Cadastrar"
                        isLoading={isLoading}
                        disabled={!isPasswordValid}
                    />
                </form>
            </div>
            <div className={styles.footer}>
                <div className={styles.lineFlex}>
                    <hr />
                    <p>Ou cadastre-se usando</p>
                    <hr />
                </div>
                <div className={styles.loginOptionsBlock}>
                    <Button
                        label="Google"
                        icon={<img src="/googleProvider.svg" />}
                        variant="glass"
                        onClick={handleGoogleAuthentication}
                    />
                    <Button
                        label="Apple"
                        icon={<img src="/appleProvider.svg" />}
                        variant="glass"
                        onClick={handleAppleAuthentication}
                    />
                </div>
                <div className={styles.singUp}>
                    <p>
                        Já tem uma conta?<Link href="/"> Entrar</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
