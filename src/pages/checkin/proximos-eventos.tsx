import styles from '@/styles/ProximosEventosMobile.module.scss';

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
                        <p className={styles.TitleActive}>PRÓXIMOS</p>
                        <p className={styles.TitleInactive}>PASSADOS</p>
                    </div>
                </div>

                <div className={styles.bodyContent}>
                    <img src="/icon_calendar.svg" alt="" />
                    <p className={styles.bodyTitle}>
                        Nenhum evento encontrado{' '}
                    </p>
                </div>
            </div>
        </>
    );
}
