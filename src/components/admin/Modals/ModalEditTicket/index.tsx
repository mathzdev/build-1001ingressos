import Button from '@/components/Button';
import { BatchData } from '@/server/db/events/types';
import { formatCurrency } from '@/utils/format/number';
import { round } from '@/utils/number';
import axios, { isAxiosError } from 'axios';
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'react-toastify';
import Switch from './Toggle';
import styles from './styles.module.scss';

interface ModalProps {
    handleClose: () => void;
    batches: BatchData[];
    editBatch: BatchData;
    eventId: string;
    isPaid?: boolean;
    onUpdate?: (batch: BatchData) => void;
}

const ModalEditTicket = ({
    handleClose,
    batches,
    editBatch,
    eventId,
    isPaid = true,
    onUpdate,
}: ModalProps) => {
    const baseStartDate = new Date(editBatch.startDate);
    const baseEndDate = new Date(editBatch.endDate);

    const [selectedButton, setSelectedButton] = useState<string>(
        editBatch.parentBatch ? 'button2' : 'button1'
    );
    const [date, setDate] = useState(baseStartDate.toISOString().split('T')[0]);
    const [time, setStartTime] = useState(
        baseStartDate.toISOString().split('T')[1].split('.')[0]
    );
    const [endDate, setEndDate] = useState(
        baseEndDate.toISOString().split('T')[0]
    );
    const [endTime, setEndTime] = useState(
        baseEndDate.toISOString().split('T')[1].split('.')[0]
    );
    const [startAmount, setStartAmount] = useState<number>(
        editBatch.startAmount
    );
    const [price, setPrice] = useState(
        !isPaid ? 'R$ 0,00' : formatCurrency(editBatch.price)
    );
    const [total, setTotal] = useState(
        isPaid ? formatCurrency(round(editBatch.price * 1.12)) : 'Gratuito'
    );
    const [selectedAvailability, setSelectedAvailability] = useState<
        'PUBLIC' | 'PRIVATE' | 'SECRET'
    >(editBatch.type);
    const [gender, setGender] = useState(editBatch.gender);
    const [name, setName] = useState(editBatch.name);
    const [description, setDescription] = useState(editBatch.description);
    const [minBuyAmount, setMinBuyAmount] = useState(editBatch.minBuyAmount);
    const [maxBuyAmount, setMaxBuyAmount] = useState(editBatch.maxBuyAmount);
    const [isVisible, setIsVisible] = useState(editBatch.isVisible);

    const [isLoading, setIsLoading] = useState(false);

    const handleButtonClick = (buttonName: string) => {
        setSelectedButton(buttonName);
    };

    const handleChangeAvailability = (event: ChangeEvent<HTMLInputElement>) => {
        setSelectedAvailability(event.target.value as any);
    };

    const handleStartAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setStartAmount(Number(value));
    };

    const handlePriceChange = (event: any) => {
        let value = event.target.value;

        // Remove os caracteres não numéricos
        value = value.replace(/\D/g, '');

        // Converte para número e divide por 100 para ter os centavos
        const numericValue = Number(value) / 100;

        // Calcula o total com a taxa de 12%
        const totalWithTax = round(numericValue * 1.12);

        // Formata os valores para exibição
        const formattedPrice = formatCurrency(numericValue);

        const formattedTotal = formatCurrency(totalWithTax);

        // Atualiza os estados
        setPrice(formattedPrice);
        setTotal(formattedTotal); // Supondo que você tenha um estado chamado total
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const {
            salePeriod,
            startDate,
            startTime,
            endDate,
            endTime,
            ...formEntries
        } = Object.fromEntries(formData.entries()) as {
            name: string;
            startAmount: string;
            price: string;
            salePeriod: string;
            gender: string;
            parentBatch?: string;
            startDate?: string;
            startTime?: string;
            endDate: string;
            endTime: string;
            type: string;
            minBuyAmount: string;
            maxBuyAmount: string;
            description: string;
            autoGenerate: string;
        };

        const name = formEntries.name.trim();
        const description = formEntries.description.trim();

        const { autoGenerate, ...convertedEntries } = {
            eventId,
            batchId: editBatch.id,
            name,
            gender: formEntries.gender,
            type: formEntries.type,
            startAmount: Number(formEntries.startAmount),
            availableAmount: Number(formEntries.startAmount),
            price: Number(
                formEntries.price
                    ? formEntries.price
                          .replace(',', '.')
                          .replace(/[^0-9\.]/g, '')
                    : 0
            ),
            minBuyAmount: Number(formEntries.minBuyAmount),
            maxBuyAmount: Number(formEntries.maxBuyAmount),
            isVisible,
            startDate: startDate
                ? new Date(`${startDate} ${startTime}`)
                : new Date(),
            endDate: new Date(`${endDate} ${endTime}`),
            description: description.length > 0 ? description : null,
            parentBatch: formEntries.parentBatch || null,
            autoGenerate: Number(formEntries.autoGenerate),
        };

        setIsLoading(true);

        try {
            const { status, data: batchData } = await axios.post<BatchData>(
                '/api/batches/update',
                convertedEntries
            );
            let message = 'Ingresso atualizado com sucesso!';

            if (status !== 200) {
                message = 'Não foi possível atualizar o ingresso';
            }
            console.log(batchData.id);
            toast.success(message);
            onUpdate?.(batchData);

            if (autoGenerate > 0) {
                batchData.availableAmount =
                    batchData.startAmount - autoGenerate;
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
                message = 'PDF dos ingressos gerados com sucesso!';
                onUpdate?.(batchData);

                const href = window.URL.createObjectURL(ticketsPDF);

                const anchorElement = document.createElement('a');

                anchorElement.href = href;
                anchorElement.download = `Ingressos - ${name}.pdf`;

                document.body.appendChild(anchorElement);
                anchorElement.click();

                document.body.removeChild(anchorElement);
                window.URL.revokeObjectURL(href);
            }

            setIsLoading(false);
            toast.success(message);
            handleClose();
        } catch (error) {
            let message = 'Não foi possível atualizar o ingresso';
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
                    <p>
                        Editar ingresso{' '}
                        <span>{isPaid ? 'pago' : 'gratuito'}</span>
                    </p>
                </header>
                <section className={styles.contentWrap}>
                    <div className={styles.topinfo}>
                        <div className={styles.inputWrapper}>
                            <h3>Título do ingresso</h3>
                            <input
                                id="name"
                                type="text"
                                placeholder="Ingresso único, Meia-Entrada, VIP, etc."
                                name="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputWrapper}>
                            <h3>Quantidade</h3>
                            <input
                                id="startAmount"
                                type="number"
                                placeholder="Ex.100"
                                name="startAmount"
                                onChange={handleStartAmountChange}
                                value={startAmount}
                                min={1}
                                required
                            />
                        </div>
                        <div className={styles.inputWrapper}>
                            <h3>Preço</h3>
                            <input
                                id="price"
                                type="text"
                                value={price}
                                onChange={handlePriceChange}
                                placeholder="R$"
                                name="price"
                                disabled={!isPaid}
                            />
                        </div>
                        <div className={styles.total}>
                            <h3>Total comprador</h3>
                            <h4>{total}</h4>
                        </div>
                    </div>

                    <div className={styles.saleInfo}>
                        <div>
                            <h3>Período das vendas deste ingresso</h3>
                            <div className={styles.buttons}>
                                <input
                                    type="radio"
                                    id="radioButton1"
                                    name="salePeriod"
                                    className={`${styles.radioButton} ${
                                        selectedButton === 'button1' &&
                                        styles.selected
                                    }`}
                                    onClick={() => handleButtonClick('button1')}
                                    defaultChecked
                                />
                                <label htmlFor="radioButton1">Por data</label>

                                <input
                                    type="radio"
                                    id="radioButton2"
                                    name="salePeriod"
                                    className={`${styles.radioButton} ${
                                        selectedButton === 'button2' &&
                                        styles.selected
                                    }`}
                                    onClick={() => handleButtonClick('button2')}
                                />
                                <label htmlFor="radioButton2">Por lote</label>
                            </div>
                        </div>
                        <div>
                            <h3>Gênero</h3>
                            <div className={styles.buttons}>
                                <input
                                    type="radio"
                                    id="button3"
                                    name="gender"
                                    className={styles.radioButton}
                                    value="MASCULINO"
                                    checked={gender === 'MASCULINO'}
                                    onChange={(e) =>
                                        setGender(
                                            e.target.value as typeof gender
                                        )
                                    }
                                />
                                <label
                                    htmlFor="button3"
                                    className={styles.radioLabel}
                                >
                                    Masculino
                                </label>

                                <input
                                    type="radio"
                                    id="button4"
                                    name="gender"
                                    className={styles.radioButton}
                                    value="FEMININO"
                                    checked={gender === 'FEMININO'}
                                    onChange={(e) =>
                                        setGender(
                                            e.target.value as typeof gender
                                        )
                                    }
                                />
                                <label
                                    htmlFor="button4"
                                    className={styles.radioLabel}
                                >
                                    Feminino
                                </label>

                                <input
                                    type="radio"
                                    id="button5"
                                    name="gender"
                                    className={styles.radioButton}
                                    value="UNISSEX"
                                    checked={gender === 'UNISSEX'}
                                    onChange={(e) =>
                                        setGender(
                                            e.target.value as typeof gender
                                        )
                                    }
                                />
                                <label
                                    htmlFor="button5"
                                    className={styles.radioLabel}
                                >
                                    Unissex
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className={styles.salePeriod}>
                        {selectedButton === 'button1' ? (
                            <>
                                <div>
                                    <label htmlFor="startDate">
                                        Data de inicio
                                    </label>
                                    <div className={styles.dateItem}>
                                        <img src="/purpleCalendar.svg" alt="" />
                                        <input
                                            id="startDate"
                                            type="date"
                                            value={date}
                                            onChange={(e) =>
                                                setDate(e.target.value)
                                            }
                                            name="startDate"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="startTime">
                                        Hora de início
                                    </label>
                                    <div className={styles.dateItem}>
                                        <img src="/purpleClock.svg" alt="" />
                                        <input
                                            id="startTime"
                                            type="time"
                                            value={time}
                                            onChange={(e) =>
                                                setStartTime(e.target.value)
                                            }
                                            name="startTime"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <label>
                                    Início das vendas quando este ingresso
                                    esgotar
                                </label>
                                <select defaultValue="" name="parentBatch">
                                    <option value="" disabled hidden>
                                        Escolher tipos de ingresso
                                    </option>
                                    {batches
                                        .filter((b) => b.id !== editBatch.id)
                                        .map((batch) => (
                                            <option
                                                key={batch.id}
                                                value={batch.id}
                                            >
                                                {batch.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label htmlFor="endDate">Data de término</label>
                            <div className={styles.dateItem}>
                                <img src="/purpleCalendar.svg" alt="" />
                                <input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        console.log(e.target.value);
                                        setEndDate(e.target.value);
                                    }}
                                    name="endDate"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="endTime">Hora de término</label>
                            <div className={styles.dateItem}>
                                <img src="/purpleClock.svg" alt="" />
                                <input
                                    id="endTime"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    name="endTime"
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.availabilityRow}>
                        <div className={styles.disponibilidade}>
                            <h3>Disponibilidade do ingresso</h3>
                            <div className={styles.disponibilidadebuttons}>
                                <div className={styles.rowRadio}>
                                    <input
                                        type="radio"
                                        id="button8"
                                        name="type"
                                        className={styles.radioButton}
                                        value="PUBLIC"
                                        checked={
                                            selectedAvailability === 'PUBLIC'
                                        }
                                        onChange={handleChangeAvailability}
                                    />
                                    <label
                                        htmlFor="button8"
                                        className={styles.radioLabel}
                                    >
                                        Para todo o público
                                    </label>
                                </div>
                                <div className={styles.rowRadio}>
                                    <input
                                        type="radio"
                                        id="button7"
                                        name="type"
                                        className={styles.radioButton}
                                        value="PRIVATE"
                                        checked={
                                            selectedAvailability === 'PRIVATE'
                                        }
                                        onChange={handleChangeAvailability}
                                    />
                                    <label
                                        htmlFor="button7"
                                        className={styles.radioLabel}
                                    >
                                        Restrito a convidados
                                    </label>
                                </div>
                                <div className={styles.rowRadio}>
                                    <input
                                        type="radio"
                                        id="button6"
                                        name="type"
                                        className={styles.radioButton}
                                        value="SECRET"
                                        checked={
                                            selectedAvailability === 'SECRET'
                                        }
                                        onChange={handleChangeAvailability}
                                    />
                                    <label
                                        htmlFor="button6"
                                        className={styles.radioLabel}
                                    >
                                        Para ser adicionado manualmente
                                    </label>
                                </div>
                            </div>
                        </div>
                        {selectedAvailability !== 'PUBLIC' && (
                            <div className={styles.inputWrapper}>
                                <h3>Gerar PDF ingressos</h3>
                                <input
                                    id="autoGenerate"
                                    type="number"
                                    placeholder="1"
                                    min={0}
                                    max={startAmount}
                                    name="autoGenerate"
                                />
                            </div>
                        )}
                    </div>

                    <div className={styles.bottomcontent}>
                        <div>
                            <h3>Quantidade permitida por compra</h3>
                            <div className={styles.undertitle}>
                                <div className={styles.inputWrapper}>
                                    <label htmlFor="minBuyAmount">Mínima</label>
                                    <input
                                        id="minBuyAmount"
                                        type="number"
                                        placeholder="1"
                                        min={1}
                                        max={startAmount}
                                        name="minBuyAmount"
                                        value={minBuyAmount}
                                        onChange={(e) =>
                                            setMinBuyAmount(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label htmlFor="maxBuyAmount">Máxima</label>
                                    <input
                                        id="maxBuyAmount"
                                        type="number"
                                        placeholder="5"
                                        name="maxBuyAmount"
                                        min={1}
                                        max={startAmount}
                                        value={maxBuyAmount}
                                        onChange={(e) =>
                                            setMaxBuyAmount(
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3>Descrição do Ingresso (opcional):</h3>
                            <textarea
                                placeholder="Informações adicionais ao nome do ingresso. Ex.: Esse ingresso dá direito a um copo"
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                </section>
                <hr />
                <footer className={styles.footerModal}>
                    <div className={styles.rowFooterModal}>
                        <div className={styles.rowToggleWithLabel}>
                            <div className={styles.wrapToggle}>
                                <Switch
                                    onColor="#fff"
                                    isOn={isVisible}
                                    name="isVisible"
                                    handleToggle={() =>
                                        setIsVisible(!isVisible)
                                    }
                                />
                            </div>
                            <text>Visibilidade do ingresso</text>
                        </div>
                        <div className={styles.rightSideFooterButton}>
                            <button
                                className={styles.Cancelar}
                                onClick={handleClose}
                            >
                                Cancelar
                            </button>
                            <Button
                                type="submit"
                                label="Atualizar ingresso"
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

export default ModalEditTicket;
