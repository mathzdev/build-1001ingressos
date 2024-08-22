import Link from 'next/link';
import { useState } from 'react';
import styles from '../../styles/MensagemIngresso.module.scss';

import DashboardLayout from '@/layouts/DashboardLayout';
import { ReactElement } from 'react';
import { NextPageWithLayout } from '../_app';

const MensagemIngresso: NextPageWithLayout = () => {
    const [mensagem, setMensagem] = useState('');

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
                                <p className={styles.title}>1001 Ingressos</p>
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
                            <Link href={'/ingressos'}>
                                <p className={styles.navItem}>VISÃO GERAL</p>
                            </Link>
                            <p className={styles.navItemActive}>
                                MENSAGEM DO INGRESSO
                            </p>
                            <p className={styles.navItem}>
                                E-MAIL DE CONFIRMAÇÃO
                            </p>
                            <Link href={'/codigos-promocionais'}>
                                <p className={styles.navItem}>
                                    CÓDIGOS PROMOCIONAIS
                                </p>
                            </Link>
                        </div>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.participantsData}>
                            <div className={styles.headArea}>
                                <p className={styles.resumeTitle}>
                                    MENSAGEM NO INGRESSO EM PDF
                                </p>
                                <button
                                    className={styles.headButton}
                                    onClick={() => setMensagem('')}
                                >
                                    LIMPAR MENSAGEM
                                </button>
                            </div>

                            <div className={styles.messageContent}>
                                <div className={styles.leftMessage}>
                                    <img src="/message.svg" alt="" />

                                    <p className={styles.messageText}>
                                        <strong>
                                            Essa mensagem só aparecerá no
                                            ingresso em PDF
                                        </strong>
                                        <br />
                                        que os participantes recebem por email.
                                    </p>

                                    <p className={styles.messageText}>
                                        Se quiser se comunicar com os
                                        participantes, você também pode
                                        adicionar uma mensagem ao{' '}
                                        <span>e-mail de confirmação</span> da
                                        compra ou <span>enviar um e-mail </span>{' '}
                                        para eles.
                                    </p>
                                </div>

                                <div className={styles.rightMessage}>
                                    <img src="/textConfig.svg" alt="" />
                                    <textarea
                                        name="mensagem"
                                        id="mensagem"
                                        value={mensagem}
                                        onChange={(e) =>
                                            setMensagem(e.target.value)
                                        }
                                    ></textarea>
                                </div>
                            </div>

                            <div className={styles.buttonContent}>
                                <button className={styles.headButton}>
                                    VER PRÉVIA
                                </button>
                                <button className={styles.headButton}>
                                    SALVAR ALTERAÇÕES
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

MensagemIngresso.getLayout = function getLayout(page: ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default MensagemIngresso;
