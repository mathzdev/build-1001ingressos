import styles from './styles.module.scss';

function formatDate(date: Date) {
    const day = date.toLocaleDateString('pt-BR', { day: '2-digit' });
    const month = date
        .toLocaleDateString('pt-BR', { month: 'short' })
        .replace('.', '')
        .toUpperCase();
    const year = date.toLocaleDateString('pt-BR', { year: 'numeric' });

    return `${day} ${month}, ${year}`;
}

function formatTime(date: Date) {
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

interface TicketFullProps {
    qrCode: string;
    eventName: string;
    name: string;
    eventPlace: string;
    ticketBatch: string;
    ticketCode: string;
    eventDate: Date;
}

const TicketFull = ({
    qrCode,
    eventName,
    name,
    eventPlace,
    ticketBatch,
    ticketCode,
    eventDate,
}: TicketFullProps) => {
    return (
        <section className={styles.ticketContainer}>
            <header>
                <h1>{eventName}</h1>
            </header>
            <div className={styles.divider} />
            <div className={styles.imageContainer}>
                <img src={qrCode} alt={eventName + ' ticket QR Code'} />
            </div>
            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span>Nome</span>
                    <p>{name}</p>
                </div>
                <div className={styles.infoItem}>
                    <span>Local</span>
                    <p>{eventPlace}</p>
                </div>
                <div className={styles.infoItem}>
                    <span>Ingresso</span>
                    <p>{ticketBatch}</p>
                </div>
                <div className={styles.infoItem}>
                    <span>Código</span>
                    <p>{ticketCode}</p>
                </div>
                <div className={styles.infoItem}>
                    <span>Data</span>
                    <p>{formatDate(eventDate)}</p>
                </div>
                <div className={styles.infoItem}>
                    <span>Hora</span>
                    <p>{formatTime(eventDate)}</p>
                </div>
            </div>
        </section>
    );
};

export default TicketFull;
