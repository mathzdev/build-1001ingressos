import { ReactNode } from 'react';
import styles from './styles.module.scss';

interface AdminCardProps {
    title: string;
    children: ReactNode;
}

const AdminCard = ({ title, children }: AdminCardProps) => {
    return (
        <div className={styles.adminCard}>
            <h3>{title}</h3>
            {children}
        </div>
    );
};

export default AdminCard;
