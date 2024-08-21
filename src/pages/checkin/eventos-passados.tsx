import styles from '@/styles/EventosPassadosMobile.module.scss';

export default function MeusEventosMobile() {
    return (
        <>
            <div className={styles.container}>
                <img src="/qr.svg" alt="" className={styles.qr} />

                <div className={styles.headContent}>
                    <div className={styles.topHead}>
                        <img src="/hamburguer.svg" alt="" />
                        <p className={styles.Title}>Meus Eventos</p>
                        <img src="/searchIcon.svg" alt="" />
                    </div>

                    <div className={styles.bottomHead}>
                        <p className={styles.TitleInactive}>PRÓXIMOS</p>
                        <p className={styles.TitleActive}>PASSADOS</p>
                    </div>
                </div>

                <div className={styles.bodyContent}>
                    <div className={styles.eventContainer}>
                        <img src="/eventoLogo.svg" alt="" />
                        <div className={styles.downEvent}>
                            <p className={styles.titleEvent}>GAAB NA SHED</p>
                            <div className={styles.item}>
                                <img src="/pont.svg" alt="" />
                                <p className={styles.descEvent}>Publicado</p>
                            </div>
                            <div className={styles.item}>
                                <img src="/loc.svg" alt="" />
                                <p className={styles.descEvent}>
                                    Shed bar - Curitiba
                                </p>
                            </div>

                            <hr />

                            <div className={styles.buttons}>
                                <p className={styles.button}>CHECK-IN</p>
                                <p className={styles.button}>VENDAS</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
