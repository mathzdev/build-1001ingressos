import Header from '@/components/admin/Header';
import SidebarNav from '@/components/admin/SidebarNav';
import { ReactNode } from 'react';
import styles from './styles.module.scss';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className={styles.container}>
            <Header />
            <SidebarNav />
            {children}
        </div>
    );
}
