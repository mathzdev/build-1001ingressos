import Link from 'next/link';
import styles from '../../styles/CodigosPromocionais.module.scss';

import { db } from '@/lib/firebaseClient';
import { collection, getDocs } from 'firebase/firestore';

import DashboardLayout from '@/layouts/DashboardLayout';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { ReactElement } from 'react';
import { NextPageWithLayout } from '../_app';

interface CouponData {
    code: string;
    discount: string;
    type: string;
    isActive: boolean;
}

export const getServerSideProps = (async (context) => {
    const querySnapshot = await getDocs(collection(db, 'coupons'));
    const coupons: CouponData[] = [];

    querySnapshot.forEach((doc) => {
        const couponData = doc.data() as Omit<CouponData, 'code'>;
        coupons.push({ ...couponData, code: doc.id });
    });

    return {
        props: {
            coupons,
        },
    };
}) satisfies GetServerSideProps;

const CodigosPromocionais: NextPageWithLayout<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ coupons }) => {
    return (
        <main className={styles.container}>
            <div className={styles.contentArea}>
                <div className={styles.allContent}>
                    <div className={styles.safeArea}>
                        <div className={styles.Head}>
                            <div className={styles.leftHead}>
                                <img
                                    src="/greenCircle.svg"
                                    alt=""
                                    className={styles.greenCircle}
                                />
                                <p className={styles.title}>Ticket King</p>
                                <img src="/Link.svg" alt="" />
                            </div>

                            <div className={styles.rightHead}>
                                <button className={styles.headButton}>
                                    EDITAR EVENTO
                                </button>
                            </div>
                        </div>

                        <div className={styles.Data}>
                            <div className={styles.dataArea}>
                                <img src="/Calendar.svg" alt="" />
                                <p className={styles.dataValue}>
                                    Quarta, 08/11/2023, 10h – Sexta, 10/11/2023,
                                    10h{' '}
                                </p>
                            </div>

                            <div className={styles.dataArea}>
                                <img src="/local.svg" alt="" />

                                <p className={styles.dataValue}>
                                    Local a definir, Curitiba, PR
                                </p>
                            </div>
                        </div>

                        <div className={styles.Nav}>
                            <Link href={'/admin/ingressos'}>
                                <p className={styles.navItem}>VISÃO GERAL</p>
                            </Link>
                            {/* <Link href={'/mensagem-do-ingresso'}>
                                <p className={styles.navItem}>
                                    MENSAGEM DO INGRESSO
                                </p>
                            </Link> */}
                            {/* <p className={styles.navItem}>
                                E-MAIL DE CONFIRMAÇÃO
                            </p> */}

                            <p className={styles.navItemActive}>
                                CÓDIGOS PROMOCIONAIS
                            </p>
                        </div>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.participantsData}>
                            <p className={styles.resumeTitle}>
                                CÓDIGOS PROMOCIONAIS
                            </p>

                            <div className={styles.messageContent}>
                                <img
                                    src="/ticket.svg"
                                    alt=""
                                    className={styles.ticket}
                                />
                                <p className={styles.ticketTitle}>
                                    Crie agora, edite e envie códigos
                                    promocionais do conteúdo
                                </p>
                                {/* <p className={styles.ticketDesc}>
                                    Crie agora, edite e envie códigos
                                    promocionais do conteúdo
                                </p> */}
                                <button className={styles.ticketButton}>
                                    Criar código promocional
                                </button>
                            </div>

                            <div className={styles.tableContainer}>
                                <div className={styles.headTable}>
                                    <p className={styles.tableTitle}>CÓDIGO</p>
                                    <p className={styles.tableTitle}>
                                        DESCONTO
                                    </p>
                                    <p className={styles.tableTitle}>TIPO</p>
                                </div>
                            </div>

                            {coupons.length > 0 ? (
                                coupons.map((coupon, index) => (
                                    <div
                                        className={styles.tableContainer}
                                        key={index}
                                    >
                                        <div className={styles.Table}>
                                            <p className={styles.tableItem}>
                                                {coupon.code}
                                            </p>
                                            <p className={styles.tableItem}>
                                                {coupon.discount}
                                            </p>
                                            <p className={styles.tableItem}>
                                                {coupon.type}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.tableContainer}>
                                    <div className={styles.Table}>
                                        <p className={styles.tableItem}>
                                            Nenhum cupom encontrado.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

CodigosPromocionais.getLayout = function getLayout(page: ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default CodigosPromocionais;
