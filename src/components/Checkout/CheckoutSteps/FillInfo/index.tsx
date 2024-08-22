import Button from '@/components/Button';
import Input from '@/components/Inputs/Input';
import MaskedInput from '@/components/Inputs/MaskedInput';
import CalendarIcon from '@/icons/CalendarIcon';
import CardIcon from '@/icons/CardIcon';
import LocationIcon from '@/icons/LocationIcon';
import PersonIcon from '@/icons/PersonIcon';
import PixIcon from '@/icons/PixIcon';
import TelIcon from '@/icons/TelIcon';
import { CheckoutStep } from '@/pages/evento/[slug]/carrinho/[cartId]';
import { BatchData } from '@/server/db/events/types';
import { UserData } from '@/server/db/users/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { HTMLAttributes, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './styles.module.scss';

interface FillInfoProps extends HTMLAttributes<HTMLDivElement> {
    batches: (BatchData & { selectedAmount: number })[];
    totalPrice: number;
    selectedPaymentMethod: 'CREDIT_CARD' | 'PIX' | null;
    onSelectedPaymentMethodChange?: (method: 'CREDIT_CARD' | 'PIX') => void;
    onChangeStep?: (step: CheckoutStep, payload?: any) => void;
    eventName: string;
    formattedEventDate: string;
    ordanizerName: string;
}

const FillInfo = ({
    batches,
    totalPrice,
    selectedPaymentMethod,
    onSelectedPaymentMethodChange,
    onChangeStep,
    eventName,
    formattedEventDate,
    ordanizerName,
    ...props
}: FillInfoProps) => {
    const { data: session, update } = useSession();

    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [useAccountInfo, setUseAccountInfo] = useState(false);

    const handlePaymentMethodSelect = (method: 'CREDIT_CARD' | 'PIX') => {
        onSelectedPaymentMethodChange?.(method);
    };

    const handleUseAccountInfoChange = (e: any) => {
        const checked = e.target.checked;
        setUseAccountInfo(checked);

        if (checked && session) {
            setFullName(session.user.name);
            setPhoneNumber(session.user.phone || '');
        } else {
            setFullName('');
            setPhoneNumber('');
        }
    };

    useEffect(() => {
        if (session) {
            setFullName(session.user.name);
            setPhoneNumber(session.user.phone || '');
            setUseAccountInfo(true);
        }
    }, [session]);

    const getToastTheme = () => {
        return window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'colored'
            : 'light';
    };

    const handleContinue = async () => {
        if (!selectedPaymentMethod) {
            toast.error('Selecione um método de pagamento!', {
                icon: <>🚨</>,
                theme: getToastTheme(),
            });
            return;
        }

        if (!fullName || !phoneNumber) {
            toast.error('Preencha todos os campos obrigatórios!', {
                icon: <>🚨</>,
                theme: getToastTheme(),
            });
            return;
        }

        if (
            fullName !== session?.user.name ||
            phoneNumber !== session?.user.phone
        ) {
            try {
                const { status, data } = await axios.post<UserData>(
                    '/api/users/updateProfile',
                    {
                        name: fullName,
                        phone: phoneNumber,
                    }
                );

                if (status !== 200) {
                    throw new Error(
                        'Erro ao atualizar informações do usuário!'
                    );
                }
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        cpf: data.cpf,
                    },
                });
            } catch (error) {
                console.error(error);
                toast.error('Erro ao atualizar informações do usuário!', {
                    icon: <>🚨</>,
                    theme: getToastTheme(),
                });
                return;
            }
        }

        onChangeStep?.('payment_method');
    };

    return (
        <section {...props}>
            <div className={styles.nameEvent}>
                <div className={styles.eventNameBlock}>
                    <h3>{eventName}</h3>
                </div>
                <div className={styles.rowLocation}>
                    <div className={styles.locationBlock}>
                        <CalendarIcon />
                        <p className={styles.dateText}>{formattedEventDate}</p>
                    </div>
                    <div className={styles.locationBlockIcon}>
                        <LocationIcon />
                        <p>{ordanizerName}</p>
                    </div>
                </div>
            </div>
            <div className={styles.pagamentoRow}>
                <p>Selecione o método de pagamento:</p>
                <div className={styles.pagamentoWrap}>
                    <div
                        className={`${styles.paymentOption} ${
                            selectedPaymentMethod === 'PIX'
                                ? styles.selected
                                : ''
                        }`}
                        onClick={() => handlePaymentMethodSelect('PIX')}
                    >
                        <PixIcon />
                        <span>Pix</span>
                    </div>
                    <div
                        className={`${styles.paymentOption} ${
                            selectedPaymentMethod === 'CREDIT_CARD'
                                ? styles.selected
                                : ''
                        }`}
                        onClick={() => handlePaymentMethodSelect('CREDIT_CARD')}
                    >
                        <CardIcon />
                        <span>Cartão de Crédito/Débito</span>
                    </div>
                </div>
            </div>
            <div className={styles.informationBlock}>
                <h3>Suas informações</h3>
                <p>Preencha as informações abaixo para finalizar a compra</p>
                <div className={styles.inputWrap}>
                    <div className={styles.rowInput}>
                        <div className={styles.blockInputWithIcon}>
                            <PersonIcon />
                            <Input
                                type="text"
                                placeholder="Nome Completo"
                                value={fullName}
                                className={styles.inputWithIcon}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div className={styles.blockInputWithIcon}>
                            <TelIcon />
                            <MaskedInput
                                type="tel"
                                placeholder="Telefone"
                                name="phone"
                                pattern="\d*"
                                required
                                mask={[
                                    {
                                        mask: '(00) 0000-0000',
                                        max: 10,
                                    },
                                    {
                                        mask: '(00) 00000-0000',
                                    },
                                ]}
                                value={phoneNumber}
                                className={styles.inputWithIcon}
                                onAccept={(value) => setPhoneNumber(value)}
                            />
                        </div>
                    </div>
                    <div className={styles.rowCheckbox}>
                        <input
                            id="useAccountInfo"
                            type="checkbox"
                            className={styles.checkbox}
                            checked={useAccountInfo}
                            onChange={handleUseAccountInfoChange}
                        />
                        <label
                            htmlFor="useAccountInfo"
                            className={styles.customLabel}
                        >
                            Usar informações da conta
                        </label>
                    </div>
                </div>
            </div>
            <div className={styles.resumoBlock}>
                <div className={styles.rowResumoBlock}>
                    <p>Resumo da compra</p>
                    <div className={styles.totalTickets}>
                        {batches.map((batch) => (
                            <p key={batch.id}>
                                {batch.selectedAmount} Ingresso
                                {batch.selectedAmount > 1 ? 's' : ''} -{' '}
                                {batch.name}
                            </p>
                        ))}

                        <div className={styles.pontilhado}></div>
                        <div className={styles.totalRow}>
                            <p>Valor Total</p>
                            <p>
                                {totalPrice.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Button
                label="Continuar"
                className={styles.buttonGradient}
                onClick={handleContinue}
            />
        </section>
    );
};

export default FillInfo;
