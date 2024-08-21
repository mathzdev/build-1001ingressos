import styles from '@/styles/DetalhesCheckinMobile.module.scss';

export default function MeusEventosMobile() {
    return (
        <>
            <div className={styles.container}>
                <img src="/qr.svg" alt="" className={styles.qr} />

                <div className={styles.headContent}>
                    <div className={styles.topHead}>
                        <img src="/back.svg" alt="" />
                        <p className={styles.Title}>On Fire! com MC DAVI</p>
                        <img src="/filter.svg" alt="" />
                    </div>
                </div>

                <div className={styles.bodyContent}>
                    <p className={styles.bodyTitle}>
                        Atualizado em 12/11/2023 às 11:58
                    </p>

                    <div className={styles.graphContent}>
                        <p className={styles.titleGraph}>0</p>
                        <p className={styles.descGraph}>Check-ins realizados</p>
                        <p className={styles.percentGraph}>0%</p>
                    </div>

                    <div className={styles.tableContent}>
                        <div className={styles.headTable}>
                            <p className={styles.descTable}>TIPO DE INGRESSO</p>
                            <div className={styles.rightTable}>
                                <p className={styles.descTable}>Realizados</p>
                                <p className={styles.descTable}>Restantes</p>
                            </div>
                        </div>
                        <div className={styles.bodyTable}>
                            <p className={styles.descTable}>Pista</p>
                            <div className={styles.rightBTable}>
                                <p className={styles.descTable}>0</p>
                                <p className={styles.descTable}>0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
