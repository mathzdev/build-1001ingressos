import { db } from '@/lib/firebaseClient';
import styles from '@/styles/Favoritos.module.scss';
import { DocumentData, collection, getDocs, query } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Favoritos() {
    const [searchTerm, setSearchTerm] = useState('');
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const q = query(collection(db, 'EVENTS'));

                const querySnapshot = await getDocs(q);

                const eventList: any[] = [];

                querySnapshot.forEach((doc) => {
                    const eventData = doc.data() as DocumentData;
                    eventList.push(eventData);
                });

                setEvents(eventList);
            } catch (error) {
                console.error('Erro ao buscar dados de eventos:', error);
            }
        };

        fetchEventData();
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredEvents = events.filter(
        (event) =>
            event.name &&
            event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <>
            <div className={styles.container}>
                <div className={styles.headContent}>
                    <div className={styles.topHead}>
                        <img src="/back.svg" alt="" />
                        <p className={styles.Title}>Eventos Favoritos</p>
                        <Link href={'/pesquisar-evento'}>
                            <img src="/searchIco.svg" alt="" />
                        </Link>
                    </div>
                </div>

                <div className={styles.bodyContent}>
                    {filteredEvents.map((event, index) => (
                        <div className={styles.eventContainer} key={index}>
                            <img
                                src={event.bannerUrl}
                                alt=""
                                className={styles.logo}
                            />
                            <div className={styles.downEvent}>
                                <div>
                                    <p className={styles.titleEvent}>
                                        {event.name}
                                    </p>

                                    <div className={styles.itemE}>
                                        <img src="/loc.svg" alt="" />
                                        <p className={styles.descEvent}>
                                            {event.address?.street}
                                        </p>
                                    </div>
                                </div>
                                <img
                                    src="/like.svg"
                                    alt=""
                                    className={styles.like}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.navBar}>
                    <Link href={'/pesquisar-evento'}>
                        <img src="/navSearch.svg" alt="" />
                    </Link>
                    <Link href={'/Home'}>
                        <img src="/navHome.svg" alt="" />
                    </Link>{' '}
                    <img
                        src="/navLike.svg"
                        alt=""
                        className={styles.navActive}
                    />
                    <Link href={'/minha-conta'}>
                        <img src="/navPerfil.svg" alt="" />
                    </Link>
                </div>
            </div>
        </>
    );
}
