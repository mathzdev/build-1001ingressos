import ArrowIcon from '@/icons/ArrowIcon';
import BtnEditIcon from '@/icons/BtnEditIcon';
import BtnHomeIcon from '@/icons/BtnHomeIcon';
import BtnOrdersIcon from '@/icons/BtnOrdersIcon';
import BtnOutIcon from '@/icons/BtnOutIcon';
import CoinIcon from '@/icons/CoinIcon';
import Logo1001Ingressos from '@/icons/Logo1001Ingressos';
import NavHomeIcon from '@/icons/NavHomeIcon';
import NavPerfilIcon from '@/icons/NavPerfilIcon';
import NavSearchIcon from '@/icons/NavSearchIcon';
import TicketIcon from '@/icons/TicketIcon';
import { db } from '@/lib/firebaseClient';
import styles from '@/styles/MinhaContaInicio.module.scss';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MouseEvent } from 'react';
import { authOptions } from '../api/auth/[...nextauth]';

export const getServerSideProps = (async (context) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    );

    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    const ticketsQuery = query(
        collection(db, 'tickets'),
        where('userId', '==', doc(db, 'users', session.user.id))
    );
    const ticketsSnapshot = await getDocs(ticketsQuery);

    const acquiredTickets = ticketsSnapshot.docs.reduce((acc, ticket) => {
        return acc + 1;
    }, 0);

    return {
        props: {
            acquiredTickets,
        },
    };
}) satisfies GetServerSideProps;

export default function MinhaContaInicio({
    acquiredTickets,
}: InferGetServerSidePropsType<typeof getServerSession>) {
    const router = useRouter();

    const navigateTo = (path: any) => {
        router.push(`/minha-conta/${path}`);
    };

    const handleSignOut = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        await signOut();
    };

    return (
        <>
            <div className={styles.container}>
                <header>
                    <Link href="/" onClick={router.back}>
                        <ArrowIcon />
                    </Link>
                    <h1>Minha Conta</h1>
                    <Logo1001Ingressos className={styles.logo} />
                </header>

                <div className={styles.bodyContent}>
                    <div className={styles.buttonsContent}>
                        <button
                            className={styles.buttonActive}
                            onClick={() => navigateTo('/')}
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
                            className={styles.button}
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

                    <div className={styles.dashBoard}>
                        <p className={styles.title}>Dashboard</p>
                        <div className={styles.item}>
                            <CoinIcon />
                            <div className={styles.itemText}>
                                <p>Saldo</p>
                                <p>
                                    <strong>0,00</strong>
                                </p>
                            </div>
                        </div>
                        <div className={styles.item}>
                            <TicketIcon />
                            <div className={styles.itemText}>
                                <p>Ingressos adquiridos</p>
                                <p>
                                    <strong>{acquiredTickets}</strong>
                                </p>
                            </div>
                        </div>
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
