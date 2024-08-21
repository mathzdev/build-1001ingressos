import styles from './styles.module.scss';

const NotFoundContainer = ({ onOpenModal }: any) => {
    return (
        <div className={styles.notFoundContainer}>
            <div className={styles.headerPart}>
                <h3>Códigos promocionais</h3>
            </div>
            <div className={styles.notFoundCuponContainer}>
                <div className={styles.bodyContent}>
                    <img src="/empty.svg" alt="Nenhum cupom encontrado" />
                    <h2>
                        Não há códigos promocionais criados para este evento.
                    </h2>
                    <p>
                        Crie agora, edite e envie códigos promocionais do
                        conteúdo
                    </p>
                    <button onClick={onOpenModal}>
                        Criar código promocional
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundContainer;
