import Button from '@/components/Button';
import styles from '@/styles/404.module.scss';
import { useRouter } from 'next/router';

export default function NotFoundPage() {
    const router = useRouter();

    const handleButtonClick = () => {
        router.push('/');
    };

    return (
        <section className={styles.container}>
            <div className={styles.content}>
                <div className={styles.leftSide}>
                    <h1>OPS! Essa página não existe.</h1>
                    <Button
                        label="Voltar para a home"
                        type="button"
                        onClick={handleButtonClick}
                    />
                </div>
                <div className={styles.rightSideDesktop}>
                    <img src="/404.webp" />
                </div>
                <div className={styles.rightSideMobile}>
                    <img src="/mobile404.webp" />
                </div>
            </div>
        </section>
    );
}
