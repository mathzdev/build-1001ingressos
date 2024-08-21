import { formatFullDate } from '@/utils/format/date';
import Link from 'next/link';
import styles from './styles.module.scss';

interface EventHeaderProps {
    event: {
        id: string;
        name: string;
        isVisible: boolean;
        startDate: number;
        endDate: number;
        fullAddress?: string;
        slug: string;
    };
    links: {
        href: string;
        label: string;
        active: boolean;
    }[];
}

const EventHeader = ({ event, links }: EventHeaderProps) => {
    return (
        <header className={styles.header}>
            <section className={styles.headerTop}>
                <div className={styles.titleContainer}>
                    <div
                        className={styles.dot}
                        data-active={
                            event.isVisible && event.endDate > Date.now()
                        }
                    />
                    <h1>{event.name}</h1>
                    <Link href={`/evento/${event.slug}`}>
                        <img src="/Link.svg" alt="" />
                    </Link>
                </div>

                <div className={styles.buttonsContainer}>
                    {/* <Button
                        label="Editar evento"
                        variant="admin"
                        size="small"
                    /> */}
                    {/* <button className={styles.button}>
                                    EXPORTAR PARTICIPANTES
                                </button>
                                <button className={styles.button}>
                                    IMPRIMIR LISTA
                                </button> */}
                </div>
            </section>

            <section className={styles.eventInfo}>
                <div>
                    <img src="/Calendar.svg" alt="" />
                    <p>
                        {formatFullDate(new Date(event.startDate))} -{' '}
                        {formatFullDate(new Date(event.endDate))}
                    </p>
                </div>

                <div>
                    <img src="/local.svg" alt="" />

                    <p>{event.fullAddress}</p>
                </div>
            </section>

            <nav role="navigation" aria-label="Secondary">
                <ul>
                    {links.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href} data-active={link.active}>
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
};

export default EventHeader;
