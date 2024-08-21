import styles from '@/styles/CheckInScanner.module.scss';

import { db } from '@/lib/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';

import AdminCard from '@/components/admin/AdminCard';
import AdminEventLayout from '@/layouts/AdminEventLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import { getPostalCodeInfo } from '@/lib/cepClient';
import { NextPageWithLayout } from '@/pages/_app';
import { EventData } from '@/server/db/events/types';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { ReactElement, useMemo } from 'react';

export const getServerSideProps = (async (context) => {
    const { eventId: paramEventId } = context.params as {
        eventId: string;
    };

    const eventSnapshot = await getDoc(doc(db, 'events', paramEventId));

    const { organizerId, startDate, endDate, ...eventData } =
        eventSnapshot.data() as EventData;

    let fullAddress = `${eventData.address.street}, ${
        eventData.address.number
    }${
        eventData.address.complement ? eventData.address.complement + ' ' : ''
    } - ${eventData.address.postalCode}`;

    try {
        const addressInfo = await getPostalCodeInfo(
            eventData.address.postalCode
        );
        fullAddress = `${addressInfo.logradouro}, ${eventData.address.number}${
            eventData.address.complement
                ? eventData.address.complement + ' '
                : ''
        } - ${addressInfo.localidade}, ${addressInfo.uf} - ${addressInfo.cep}`;
    } catch (error) {
        console.error(error);
    }

    return {
        props: {
            event: {
                id: eventSnapshot.id,
                ...eventData,
                startDate: startDate.toMillis(),
                endDate: endDate.toMillis(),
                fullAddress,
            },
        },
    };
}) satisfies GetServerSideProps;

const CheckInScanner: NextPageWithLayout<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ event }) => {
    const router = useRouter();
    const { eventId } = router.query;

    const links = useMemo(() => {
        return [
            {
                href: `/admin/visao-geral/${eventId}`,
                label: 'Visão geral',
                active: false,
            },
            {
                href: `/admin/check-in-online/${eventId}`,
                label: 'Check-in online',
                active: false,
            },
            {
                href: `/admin/check-in-scanner/${eventId}`,
                label: 'Check-in via scanner',
                active: true,
            },
        ];
    }, [eventId]);

    return (
        <main className={styles.container}>
            <AdminEventLayout event={event} links={links}>
                <AdminCard title="Check-in via scanner">
                    <div className={styles.tableContainer}>
                        <div className={styles.Table}>
                            <p className={styles.resumeTitle}>
                                Campo de leitura
                            </p>
                        </div>
                    </div>

                    <div className={styles.tutorialContainer}>
                        <img src="/one.svg" alt="" />
                        <p className={styles.tutorial}>
                            Mantenha o cursor no campo de leitura acima.
                        </p>
                    </div>

                    <div className={styles.tutorialContainer}>
                        <img src="/two.svg" alt="" />
                        <p className={styles.tutorial}>
                            Escaneie o código de barras presente no ingresso.
                        </p>
                    </div>

                    <img src="/example.svg" alt="" className={styles.example} />
                </AdminCard>
            </AdminEventLayout>
        </main>
    );
};

CheckInScanner.getLayout = function getLayout(page: ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default CheckInScanner;
