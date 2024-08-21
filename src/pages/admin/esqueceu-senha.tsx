import Button from '@/components/Button';
import LogoTicketKing from '@/icons/LogoTicketKing';
import styles from '@/styles/Login.module.scss';

export default function EsqueceuSenha() {
    return (
        <section className={styles.container}>
            <div className={styles.headerPart}>
                <LogoTicketKing className={styles.logo} />
                <h1>Redefinir senha</h1>
                <span>
                    Você receberá um e-mail com instruções para redefinir a
                    senha
                </span>
            </div>
            <div className={styles.content}>
                <form className={styles.formSection}>
                    <div className={styles.inputBlock}>
                        <label>E-mail</label>
                        <input type="email" />
                    </div>

                    <Button
                        label="Recuperar senha"
                        // isLoading={isLoading}
                        type="submit"
                        form="loginAdmin"
                    />
                </form>
            </div>
        </section>
    );
}
