import Button from '@/components/Button';
import Input from '@/components/Inputs/Input';
import MaskedInput from '@/components/Inputs/MaskedInput';
import ArrowIcon from '@/icons/ArrowIcon';
import BtnEditIcon from '@/icons/BtnEditIcon';
import BtnHomeIcon from '@/icons/BtnHomeIcon';
import BtnOrdersIcon from '@/icons/BtnOrdersIcon';
import BtnOutIcon from '@/icons/BtnOutIcon';
import LogoTicketKing from '@/icons/LogoTicketKing';
import NavHomeIcon from '@/icons/NavHomeIcon';
import NavPerfilIcon from '@/icons/NavPerfilIcon';
import NavSearchIcon from '@/icons/NavSearchIcon';
import { UserData } from '@/server/db/users/types';
import styles from '@/styles/MinhaContaEditar.module.scss';
import axios from 'axios';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MouseEvent, useState } from 'react';
import { toast } from 'react-toastify';

export default function MinhaContaEditar() {
    const { data: session, update } = useSession();

    const [name, setName] = useState(session?.user.name ?? '');
    const [email, setEmail] = useState(session?.user.email ?? '');
    const [phone, setPhone] = useState(session?.user.phone ?? '');
    const [cpf, setCpf] = useState(session?.user.cpf ?? '');

    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const navigateTo = (path: any) => {
        router.push(`/minha-conta/${path}`);
    };

    const handleSignOut = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        await signOut();
    };

    const updateUserData = async () => {
        try {
            setIsLoading(true);
            const { status, data } = await axios.post<UserData>(
                '/api/users/updateProfile',
                {
                    name,
                    phone,
                    cpf,
                    email,
                }
            );

            setIsLoading(false);

            if (status !== 200) {
                throw new Error('Erro ao atualizar informações do usuário!');
            }

            setName(data.name);
            setEmail(data.email);
            setPhone(data.phone);
            setCpf(data.cpf ?? '');

            toast.success('Dados do usuário atualizados com sucesso!', {
                icon: '👍',
            });

            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    cpf: data.cpf,
                },
            });
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar informações do usuário!', {
                icon: '🚨',
            });
            return;
        }
    };

    return (
        <>
            <div className={styles.container}>
                <header>
                    <Link href="#" onClick={router.back}>
                        <ArrowIcon />
                    </Link>
                    <h1>Minha Conta</h1>
                    <LogoTicketKing className={styles.logo} />
                </header>

                <div className={styles.bodyContent}>
                    <div className={styles.buttonsContent}>
                        <button
                            className={styles.button}
                            onClick={() => navigateTo('')}
                        >
                            <BtnHomeIcon />
                            <p>Início</p>
                        </button>
                        <button
                            className={styles.button}
                            onClick={() => navigateTo('pedidos')}
                        >
                            <BtnOrdersIcon />
                            <p>Meus ingressos</p>
                        </button>
                        <button
                            className={styles.buttonActive}
                            onClick={() => navigateTo('editar')}
                        >
                            <BtnEditIcon />
                            <p>Editar conta</p>
                        </button>
                        <button
                            className={styles.button}
                            onClick={handleSignOut}
                        >
                            <BtnOutIcon data-stroke="true" />
                            <p>Sair da conta</p>
                        </button>
                    </div>

                    <p className={styles.order}>
                        Atualize seus dados nos campos abaixo:
                    </p>

                    <div className={styles.editContainer}>
                        <div className={styles.inputContainer}>
                            <Input
                                label="Nome"
                                placeholder="Nome"
                                value={name}
                                required
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <Input
                                type="email"
                                label="E-mail"
                                placeholder="E-mail"
                                value={email}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <MaskedInput
                                label="Telefone"
                                type="tel"
                                placeholder="Telefone"
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
                                unmask={true}
                                value={phone}
                                onAccept={(value: string) => setPhone(value)}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <MaskedInput
                                type="text"
                                label="CPF"
                                placeholder="CPF"
                                name="cpf"
                                pattern="\d*"
                                required
                                mask="000.000.000-00"
                                unmask={true}
                                value={cpf}
                                onAccept={(value: string) => setCpf(value)}
                            />
                        </div>

                        <Button
                            onClick={updateUserData}
                            label="Atualizar informações"
                            isLoading={isLoading}
                        />
                    </div>
                </div>

                <div className={styles.navBar}>
                    <Link href={'/pesquisar-evento'}>
                        <NavSearchIcon />
                    </Link>
                    <Link href={'/'}>
                        <NavHomeIcon />
                    </Link>{' '}
                    <Link href={'/minha-conta'}>
                        <NavPerfilIcon className={styles.navActive} />
                    </Link>
                </div>
            </div>
        </>
    );
}
