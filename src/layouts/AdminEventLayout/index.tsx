import EventHeader from '@/components/admin/Event/EventHeader';
import { ReactNode } from 'react';
import styles from './styles.module.scss';

interface AdminEventLayoutProps {
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
    children: ReactNode;
}

export default function AdminEventLayout({
    event,
    links,
    children,
}: AdminEventLayoutProps) {
    return (
        <div className={styles.container}>
            <EventHeader event={event} links={links} />
            <article>{children}</article>
        </div>
    );
}
