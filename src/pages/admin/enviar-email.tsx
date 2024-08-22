import Link from 'next/link';
import styles from '../../styles/EnviarEmail.module.scss';

import DashboardLayout from '@/layouts/DashboardLayout';
import { ReactElement } from 'react';
import { NextPageWithLayout } from '../_app';

const EnviarEmail: NextPageWithLayout = () => {
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
                                <button className={styles.headButton}>
                                    EXPORTAR PARTICIPANTES
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
                            <Link href={'/admin/administrar-participantes'}>
                                <p className={styles.navItem}>
                                    ADMINISTRAR PARTICIPANTES
                                </p>
                            </Link>

                            <p className={styles.navItemActive}>
                                ENVIAR E-MAIL
                            </p>

                            {/* <Link href={'/certificados'}>
                                <p className={styles.navItem}>CERTIFICADOS</p>
                            </Link> */}
                        </div>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.participantsData}>
                            <div className={styles.headContent}>
                                <p className={styles.resumeTitle}>
                                    CONFIGURAR EMAIL
                                </p>
                            </div>

                            <div className={styles.searchContainer}>
                                <div className={styles.right}>
                                    <p className={styles.selectTitle}>
                                        Tipos de ingressos que receberão esse
                                        e-mail
                                    </p>

                                    <select
                                        name="statusTransacao"
                                        id="statusTransacao"
                                        className={styles.selectField}
                                    >
                                        <option value="todas">
                                            Todos os ingressos
                                        </option>
                                        <option value="aprovadas">
                                            Premium
                                        </option>
                                        <option value="reprovadas">
                                            Regulares
                                        </option>
                                    </select>
                                </div>

                                <div className={styles.right}>
                                    <p className={styles.selectTitle}>
                                        Status de check-in dos participantes
                                    </p>

                                    <select
                                        name="statusTransacao"
                                        id="statusTransacao"
                                        className={styles.selectField}
                                    >
                                        <option value="todas">
                                            Qualquer um
                                        </option>
                                        <option value="aprovadas">
                                            Aprovado
                                        </option>
                                        <option value="reprovadas">
                                            Reprovado
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.participantsData}>
                            <div className={styles.headContent}>
                                <p className={styles.resumeTitle}>
                                    ESCREVER MENSAGEM
                                </p>
                            </div>

                            <div className={styles.allInputContainer}>
                                <div className={styles.inputContainer}>
                                    <p className={styles.selectTitle}>
                                        Nome do remetente:
                                    </p>

                                    <input
                                        type="text"
                                        className={styles.selectField}
                                    />
                                </div>

                                <div className={styles.inputContainer}>
                                    <p className={styles.selectTitle}>
                                        Responder a:
                                    </p>

                                    <input
                                        type="text"
                                        className={styles.selectField}
                                    />
                                </div>

                                <div className={styles.inputContainer}>
                                    <p className={styles.selectTitle}>
                                        Assunto do e-mail
                                    </p>

                                    <input
                                        type="text"
                                        className={styles.selectField}
                                    />
                                </div>

                                <div className={styles.inputContainer}>
                                    <p className={styles.selectTitle}>
                                        Mensagem:
                                    </p>

                                    <textarea className={styles.selectField} />
                                </div>
                            </div>
                        </div>

                        <div className={styles.buttons}>
                            <button className={styles.endButton}>
                                EDITAR EVENTO
                            </button>
                            <button className={styles.endButton}>
                                EXPORTAR PARTICIPANTES
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

EnviarEmail.getLayout = function getLayout(page: ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default EnviarEmail;
