import Link from 'next/link';
import { MouseEvent, useState } from 'react';
import styles from '../styles/Pesquisar.module.scss';

import LogoTicketKing from '@/icons/LogoTicketKing';
import NavHomeIcon from '@/icons/NavHomeIcon';
import NavPerfilIcon from '@/icons/NavPerfilIcon';
import NavSearchIcon from '@/icons/NavSearchIcon';
import { db } from '@/lib/firebaseClient';
import { EventData } from '@/server/db/events/types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useSession } from 'next-auth/react';

type Event = Omit<EventData, 'organizerId' | 'startDate' | 'endDate'> & {
    id: string;
    startDate: string;
    endDate: string;
};

export const getServerSideProps = (async () => {
    const eventsQuery = query(
        collection(db, 'events'),
        where('isVisible', '==', true)
    );

    const eventsSnapshot = await getDocs(eventsQuery);

    const initialEvents: Event[] = [];

    eventsSnapshot.forEach((eventSnapshot) => {
        const { organizerId, startDate, endDate, ...eventData } =
            eventSnapshot.data() as EventData;
        initialEvents.push({
            ...eventData,
            id: eventSnapshot.id,
            startDate: startDate.toDate().toISOString(),
            endDate: endDate.toDate().toISOString(),
        });
    });

    return {
        props: {
            initialEvents,
        },
    };
}) satisfies GetServerSideProps;

export default function Favoritos({
    initialEvents,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { status } = useSession();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredEvents = initialEvents.filter(
        (event) =>
            event.name &&
            event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleMyAccountClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        if (status === 'authenticated') {
            window.location.href = '/minha-conta';
        } else {
            window.SignInModal.show();
        }
    };

    return (
        <>
            <div className={styles.container}>
                <header>
                    <LogoTicketKing />
                    <div className={styles.searchBar}>
                        <div className={styles.iconWrapper}>
                            <NavSearchIcon />
                        </div>
                        <input
                            type="text"
                            placeholder="Pesquisar eventos..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />{' '}
                    </div>
                </header>

                <div className={styles.bodyContent}>
                    <h1>Resultados</h1>

                    <main>
                        {filteredEvents.map((event, index) => (
                            <Link href={`/evento/${event.slug}`} key={index}>
                                <div className={styles.eventCard}>
                                    <div className={styles.bannerWrapper}>
                                        <img src={event.bannerUrl} alt="" />
                                    </div>
                                    <div className={styles.downEvent}>
                                        <p className={styles.titleEvent}>
                                            {event.name}
                                        </p>

                                        <div className={styles.itemE}>
                                            <img src="/loc.svg" alt="" />
                                            <p className={styles.descEvent}>
                                                {event.address?.street},{' '}
                                                {event.address?.number}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </main>
                </div>

                <div className={styles.navBar}>
                    <Link href={'/pesquisar-evento'}>
                        <NavSearchIcon className={styles.navActive} />
                    </Link>
                    <Link href={'/'}>
                        <NavHomeIcon />
                    </Link>{' '}
                    <Link href={'/minha-conta'} onClick={handleMyAccountClick}>
                        <NavPerfilIcon />
                    </Link>
                </div>
            </div>
        </>
    );
}
