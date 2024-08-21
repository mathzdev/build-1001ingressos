import styles from '@/styles/VendasMobile.module.scss';
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
                        <p className={styles.TitleActive}>CHECK-IN</p>

                        <p
                            className={styles.TitleInactive}
                            onClick={() => router.push('/checkin/vendas')}
                        >
                            VENDAS
                        </p>
                    </div>
                </div>

                <div className={styles.bodyContent}>
                    <div className={styles.resumeData}>
                        <div className={styles.resumeTop}>
                            <p className={styles.TitleResume}>
                                Resumo de check-in
                            </p>
                            <p className={styles.viewResume}>Ver detalhes</p>
                        </div>

                        <p className={styles.TitleResumeV}>0% (0) Realizados</p>

                        <p className={styles.TitleResumeT}>
                            100% (136) restantes
                        </p>
                    </div>

                    <button className={styles.listButton}>
                        Lista de participantes
                    </button>
                    <button className={styles.listButton}>
                        Fazer check-in
                    </button>
                    <p className={styles.bodyTitle}>
                        Atualizado em 12/11/2023 às 11:58
                    </p>
                </div>
            </div>
        </>
    );
}
