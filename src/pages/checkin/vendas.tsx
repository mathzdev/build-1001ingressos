import styles from '@/styles/CheckInMobile.module.scss';
import { useRouter } from 'next/router';

export default function MeusEventosMobile() {
    const router = useRouter();
    return (
        <>
            <div className={styles.container}>
                <img src="/qr.svg" alt="" className={styles.qr} />

                <div className={styles.headContent}>
                    <img src="/banner.svg" alt="" className={styles.banner} />
                </div>

                <div className={styles.headContent}>
                    <div className={styles.topHead}>
                        <p className={styles.Date}>
                            14 de novembro de 2023, 22:30
                        </p>
                        <p className={styles.Title}>On Fire! com MC DAVI</p>
                        <p className={styles.Local}>Shed bar - Curitiba</p>
                    </div>

                    <div className={styles.bottomHead}>
                        <p
                            className={styles.TitleInactive}
                            onClick={() => router.push('/checkin/checkin')}
                        >
                            CHECK-IN
                        </p>

                        <p className={styles.TitleActive}>VENDAS</p>
                    </div>
                </div>

                <div className={styles.bodyContent}>
                    <div className={styles.resumeData}>
                        <div className={styles.resumeTop}>
                            <p className={styles.TitleResume}>
                                Resumo de Vendas
                            </p>
                            <p className={styles.viewResume}>Ver detalhes</p>
                        </div>

                        <div className={styles.midle}>
                            <div>
                                <p className={styles.TitleResumeV}>
                                    R$ 5.045,49
                                </p>
                                <p className={styles.TitleResumeD}>
                                    Vendas totais
                                </p>
                            </div>

                            <div>
                                <p className={styles.TitleResumeV}>
                                    R$ 5.045,49
                                </p>
                                <p className={styles.TitleResumeD}>
                                    Repasse total
                                </p>
                            </div>
                        </div>

                        <br />
                        <p className={styles.TitleResumeD}>
                            Ingressos confirmados: <span>136</span>
                        </p>
                    </div>

                    <div className={styles.resumeDataD}>
                        <div className={styles.resumeTop}>
                            <p className={styles.TitleResume}>
                                Resumo de Vendas
                            </p>
                            <p className={styles.viewResume}>Ver detalhes</p>
                        </div>

                        <div className={styles.midle}>
                            <div>
                                <p className={styles.TitleResumeV}>
                                    R$ 5.045,49
                                </p>
                                <p className={styles.TitleResumeD}>
                                    Vendas pendentes
                                </p>
                            </div>
                        </div>

                        <br />
                        <p className={styles.TitleResumeD}>
                            Ingressos pendents: <span>136</span>
                        </p>
                    </div>

                    <p className={styles.bodyTitle}>
                        Atualizado em 12/11/2023 às 11:58
                    </p>
                </div>
            </div>
        </>
    );
}
