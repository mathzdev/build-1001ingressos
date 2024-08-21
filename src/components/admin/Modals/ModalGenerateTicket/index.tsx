import Button from '@/components/Button';
import { BatchData } from '@/server/db/events/types';
import axios, { isAxiosError } from 'axios';
import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './styles.module.scss';

interface ModalProps {
    handleClose: () => void;
    eventId: string;
    batchData: BatchData;
    onCreate?: (batch: BatchData) => void;
}

const ModalGenerateTicket = ({
    handleClose,
    eventId,
    batchData,
    onCreate,
}: ModalProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const formEntries = Object.fromEntries(formData.entries()) as {
            autoGenerate: string;
        };

        const autoGenerate = Number(formEntries.autoGenerate);

        setIsLoading(true);

        try {
            let message = 'PDF dos ingressos gerados com sucesso!';
            if (autoGenerate > 0) {
                batchData.availableAmount -= autoGenerate;
                onCreate?.(batchData);

                const { status: status2, data: ticketsPDF } =
                    await axios.post<Blob>(
                        '/api/tickets/createFreeTickets',
                        {
                            eventId,
                            batchId: batchData.id,
                            amount: autoGenerate,
                        },
                        {
                            responseType: 'blob',
                        }
                    );

                if (status2 !== 200) {
                    message = 'Não foi gerar os ingressos';
                }

                const href = window.URL.createObjectURL(ticketsPDF);

                const anchorElement = document.createElement('a');

                anchorElement.href = href;
                anchorElement.download = `Ingressos - ${batchData.name}.pdf`;

                document.body.appendChild(anchorElement);
                anchorElement.click();

                document.body.removeChild(anchorElement);
                window.URL.revokeObjectURL(href);
            }

            setIsLoading(false);
            toast.success(message);
            handleClose();
        } catch (error) {
            let message = 'Não foi possível criar o ingresso';
            if (isAxiosError(error)) {
                console.log(error.response?.data);
                switch (error.response?.data.error) {
                    case 'invalid_request':
                        message = 'Os dados enviados são inválidos';
                        break;
                    case 'start_date_after_end_date':
                        message = 'A data de início deve ser antes da de fim';
                        break;
                    default:
                        break;
                }
            } else {
                console.log(error);
            }
            toast.error(message);
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <form
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <header>
                    <p>Criar ingressos</p>
                </header>
                <section className={styles.contentWrap}>
                    <div className={styles.availabilityRow}>
                        <div className={styles.inputWrapper}>
                            <h3>Quantiade de ingressos</h3>
                            <input
                                id="autoGenerate"
                                type="number"
                                placeholder="1"
                                min={1}
                                max={batchData.availableAmount}
                                name="autoGenerate"
                            />
                        </div>
                    </div>
                </section>
                <hr />
                <footer className={styles.footerModal}>
                    <div className={styles.rowFooterModal}>
                        <div className={styles.rightSideFooterButton}>
                            <button
                                className={styles.Cancelar}
                                onClick={handleClose}
                            >
                                Cancelar
                            </button>
                            <Button
                                type="submit"
                                label="Criar ingressos"
                                isLoading={isLoading}
                                variant="admin-secondary"
                                size="small"
                            />
                        </div>
                    </div>
                </footer>
            </form>
        </div>
    );
};

export default ModalGenerateTicket;
