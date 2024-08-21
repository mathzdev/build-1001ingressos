import { useSession } from 'next-auth/react';
import styles from './styles.module.scss';

const Header = () => {
    const session = useSession();
    return (
        <header className={styles.header}>
            <a href="#">Área do produtor</a>

            <div className={styles['avatar-wrapper']}>
                {/* <a href="#"> */}
                <img src={session.data?.user.image} alt="" />
                {/* </a> */}
            </div>
        </header>
    );
};

export default Header;
