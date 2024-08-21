import styles from '../styles/ListaParticipantesMobile.module.scss';

export default function ListaParticipantesMobile() {
    return (
        <>
            <div className={styles.container}>
                <img src="/qr.svg" alt="" className={styles.qr} />

                <div className={styles.headContent}>
                    <div className={styles.topHead}>
                        <img src="/back.svg" alt="" />
                        <p className={styles.Title}>Lista de participantes</p>
                        <img src="/searchIcon.svg" alt="" />
                    </div>

                    <div className={styles.bottomHead}>
                        <p className={styles.TitleActive}>TODOS</p>
                        <p className={styles.TitleInactive}>REALIZADOS</p>
                        <p className={styles.TitleInactive}>RESTANTES</p>
                    </div>
                </div>

                <div className={styles.bodyContent}>
                    <img src="/users.svg" alt="" />
                    <p className={styles.bodyTitle}>
                        Ainda não há participantes{' '}
                    </p>
                </div>
            </div>
        </>
    );
}
