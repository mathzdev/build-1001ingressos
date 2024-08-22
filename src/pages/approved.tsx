import styles from '@/styles/Approved.module.scss';

export default function Aprovado() {
    return (
        <section className={styles.container}>
            <div className={styles.topPart}>
                <div className={styles.row1}>
                    <img src="/arrowLeft1001Ingressos.svg" />
                    <h6>Adicionar cartão</h6>
                </div>
                <div className={styles.steps}>
                    <div className={`${styles.circle} ${styles.completed}`}>
                        <img
                            src="/checkIcon.svg"
                            alt="Completed"
                            className={styles.checkIcon}
                        />
                    </div>
                    <div className={styles.line}></div>
                    <div className={`${styles.circle} ${styles.completed}`}>
                        <img
                            src="/checkIcon.svg"
                            alt="Completed"
                            className={styles.checkIcon}
                        />
                    </div>
                    <div className={styles.line}></div>
                    <div className={`${styles.circle} ${styles.completed}`}>
                        <img
                            src="/checkIcon.svg"
                            alt="Completed"
                            className={styles.checkIcon}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.middleContent}>
                <div className={styles.checkedApprove}>
                    <img src="/images/approvedPayment.webp" />
                </div>
                <div className={styles.accordionPayment}>
                    <h2>Pagamento efetuado!</h2>
                    <div className={styles.resumoBlock}>
                        <p>Detalhes de Pagamento</p>
                        <div className={styles.rowAccordionPayment}>
                            <span>Ref number</span>
                            <p>01250362515</p>
                        </div>
                        <div className={styles.rowAccordionPayment}>
                            <span>Payment Status</span>
                            <p>Success</p>
                        </div>
                        <div className={styles.rowAccordionPayment}>
                            <span>Payment Time</span>
                            <p>Success</p>
                        </div>
                        <div className={styles.pontilhado}></div>
                        <div className={styles.totalRow}>
                            <p>Valor total</p>
                            <p>R$36,99</p>
                        </div>
                    </div>
                </div>
            </div>
            <button className={styles.backHome}>Voltar para Home</button>
        </section>
    );
}
