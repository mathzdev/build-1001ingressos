import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './styles.module.scss';

const ModalEditPromoCode = ({
    isOpen,
    onClose,
    eventId,
    currentCoupon,
    oneEditCoupon,
}: any) => {
    const [selectedButton, setSelectedButton] = useState<string>('');
    const [codigo, setCodigo] = useState('');
    const [porcentagem, setPorcentagem] = useState('');
    const [valor, setValor] = useState('');

    useEffect(() => {
        if (isOpen && currentCoupon) {
            setSelectedButton(
                currentCoupon.type === 'percent' ? 'button1' : 'button2'
            );
            setCodigo(currentCoupon.couponCode.toUpperCase());
            setPorcentagem(
                currentCoupon.type === 'percent'
                    ? `${currentCoupon.discount}%`
                    : ''
            );
            setValor(
                currentCoupon.type === 'fixed'
                    ? `R$ ${Number(currentCoupon.discount)
                          .toFixed(2)
                          .replace('.', ',')}`
                    : ''
            );
        }
    }, [isOpen, currentCoupon]);

    const handleInputChange = (e: any) => {
        let valorEntrada = e.target.value;
        valorEntrada = valorEntrada.replace(/\D/g, '');
        if (valorEntrada) {
            valorEntrada = (Number(valorEntrada) / 100).toFixed(2);
            valorEntrada = valorEntrada.replace('.', ',');
            valorEntrada = valorEntrada.replace(
                /(\d)(?=(\d{3})+(?!\d))/g,
                '$1.'
            );
        }
        setValor(`R$ ${valorEntrada}`);
    };

    const handleInputPorcentagemChange = (e: any) => {
        let valor = e.target.value;
        valor = valor.replace(/[^0-9]/g, '');
        if (valor) valor = `${valor}%`;
        setPorcentagem(valor);
    };

    const handleButtonClick = (buttonName: string) => {
        setSelectedButton(buttonName);
    };

    const handleInputCodigoChange = (e: any) => {
        let valor = e.target.value;
        valor = valor.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        setCodigo(valor);
    };

    const handleSubmit = async () => {
        const type = selectedButton === 'button1' ? 'percent' : 'fixed';

        const discount =
            selectedButton === 'button1'
                ? porcentagem.replace('%', '')
                : valor.replace('R$ ', '').replace('.', '').replace(',', '.');

        const transFormedCondigo = codigo.toLocaleLowerCase();

        if (!transFormedCondigo) {
            toast.error('O cupom precisa de um nome!', {
                icon: '🚨',
            });

            return;
        }

        try {
            const response = await fetch('/api/coupons/editCoupon', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId,
                    newCouponCode: transFormedCondigo,
                    oldCouponCode: currentCoupon.couponCode,
                    discount,
                    type,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Cupom Editado com sucesso!', {
                    icon: '🎉',
                });
                const editedCoupon = {
                    couponCode: transFormedCondigo,
                    discount,
                    isActive: true,
                    type,
                };
                oneEditCoupon(editedCoupon);
                onClose();
                setCodigo('');
                setPorcentagem('');
                setValor('');
            } else if (response.status === 409) {
                toast.error(
                    'Um cupom com este código já existe para este evento.',
                    {
                        icon: '🚨',
                    }
                );
            } else {
                toast.error(data.error || 'Erro ao criar o cupom', {
                    icon: '🚨',
                });
            }
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
            toast.error('Erro ao enviar o formulário', {
                icon: '🚨',
            });
        }
    };

    return (
        isOpen && (
            <div className={styles.modalOverlay} onClick={onClose}>
                <div
                    className={styles.modalContent}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.topPart}>
                        <h4>Editar código promocional</h4>
                    </div>
                    <div className={styles.inputBlock}>
                        <p>Código*</p>
                        <input
                            type="text"
                            placeholder="Inserir código"
                            value={codigo}
                            onChange={handleInputCodigoChange}
                        />
                        <text>Não utilize espaço e caracteres especiais</text>
                    </div>
                    <div className={styles.discountWrap}>
                        <p>Desconto</p>
                        <div className={styles.rowDiscount}>
                            <div className={styles.blockRadioButton}>
                                <input
                                    type="radio"
                                    id="radioButton1"
                                    name="salePeriod"
                                    className={`${styles.radioButton} ${
                                        selectedButton === 'button1' &&
                                        styles.selected
                                    }`}
                                    required
                                    onClick={() => handleButtonClick('button1')}
                                    checked={selectedButton === 'button1'}
                                />
                                <input
                                    type="text"
                                    placeholder="0%"
                                    value={porcentagem}
                                    onChange={handleInputPorcentagemChange}
                                    disabled={selectedButton === 'button2'}
                                />
                            </div>
                            <div className={styles.blockRadioButton}>
                                <input
                                    type="radio"
                                    id="radioButton2"
                                    name="salePeriod"
                                    className={`${styles.radioButton} ${
                                        selectedButton === 'button1' &&
                                        styles.selected
                                    }`}
                                    onClick={() => handleButtonClick('button2')}
                                    checked={selectedButton === 'button2'}
                                />
                                <input
                                    type="text"
                                    placeholder="R$ 0,00"
                                    value={valor}
                                    onChange={handleInputChange}
                                    disabled={selectedButton === 'button1'}
                                />
                            </div>
                        </div>
                        <div className={styles.bottomButtons}>
                            <button
                                className={styles.Cancelar}
                                onClick={onClose}
                            >
                                cancelar
                            </button>
                            <button
                                className={styles.Criar}
                                onClick={handleSubmit}
                            >
                                editar código
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default ModalEditPromoCode;
