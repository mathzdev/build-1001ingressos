import Button from '@/components/Button';
import Card, { CardInputTypes } from '@/components/Card';
import DateSelect from '@/components/DateSelect';
import Input from '@/components/Inputs/Input';
import MaskedInput from '@/components/Inputs/MaskedInput';
import CardIconwithBorder from '@/icons/CardIconWithBorder';
import CheckWhite from '@/icons/CheckWhite';
import EyeIcon from '@/icons/EyeIcon';
import NotesIcon from '@/icons/NotesIcon';
import { CheckoutStep } from '@/pages/evento/[slug]/carrinho/[cartId]';
import { PaymentError } from '@/server/paymentGateways/error';
import { getCardType } from '@/utils/card';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import {
    ChangeEvent,
    FocusEvent,
    FormEvent,
    HTMLAttributes,
    MutableRefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import 'react-calendar/dist/Calendar.css';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import { toast } from 'react-toastify';
import styles from './styles.module.scss';

interface PostalCodeResponse {
    cep: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    service: string;
    location: {
        type: string;
        coordinates: {
            longitude: string;
            latitude: string;
        };
    };
}

interface ViaCEPPostalCodeResponse {
    cep: string;
    uf: string;
    localidade: string;
    bairro: string;
    logradouro: string;
}

interface CardPaymentProps extends HTMLAttributes<HTMLDivElement> {
    cartId: string;
    onChangeStep?: (step: CheckoutStep, payload?: any) => void;
}

const CardPayment = ({ cartId, onChangeStep, ...props }: CardPaymentProps) => {
    const { data: session } = useSession();
    const [cardNumber, setCardNumber] = useState('');
    const prevCardNumber = useRef<string>('');
    const [cardMonth, setCardMonth] = useState('');
    const [cardYear, setCardYear] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [isCardFlipped, setIsCardFlipped] = useState(false);

    const [maxCardNumberLength, setMaxCardNumberLength] = useState(16);

    const [currentFocusedElm, setCurrentFocusedElm] =
        useState<CardInputTypes | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [birthDate, setBirthDate] = useState<Date | null>(new Date());

    const cardNumberRef = useRef<HTMLInputElement>(null);
    const cardHolderRef = useRef<HTMLInputElement>(null);
    const cardDateRef = useRef<HTMLSelectElement>(null);
    const cursorPositionRef = useRef<number>(0);

    const handleCardHolderChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCardHolder(event.target.value);
    };

    const handleCardMonthChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setCardMonth(event.target.value);
    };

    const handleCardYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setCardYear(event.target.value);
    };

    const handleCardCvvChange = (event: ChangeEvent<HTMLInputElement>) => {
        setCardCvv(event.target.value);
    };

    let handleCardFormInputFocus = (
        event: FocusEvent<HTMLInputElement | HTMLSelectElement>,
        inputName: CardInputTypes
    ) => {
        setCurrentFocusedElm(inputName);
    };

    let handleCardInputBlur = useCallback(() => {
        setCurrentFocusedElm(null);
    }, []);

    const handleCardElementClick = (type: CardInputTypes) => {
        const refs: { [key in CardInputTypes]: MutableRefObject<any> } = {
            cardNumber: cardNumberRef,
            cardHolder: cardHolderRef,
            cardDate: cardDateRef,
        };

        refs[type].current.focus();
    };

    const onCardNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
        let newCardNumber = event.target.value;
        newCardNumber = newCardNumber.replace(/\D/g, '');
        const card = getCardType(newCardNumber);
        newCardNumber = card.format(newCardNumber);

        if (cardNumberRef.current) {
            cursorPositionRef.current =
                cardNumberRef.current.selectionStart ?? 0;
        }

        setMaxCardNumberLength(card.maxLength);

        setCardNumber((oldValue) => {
            prevCardNumber.current = oldValue;

            return newCardNumber;
        });
    };

    const onCvvFocus = (event: FocusEvent<HTMLInputElement>) => {
        setIsCardFlipped(true);
    };

    const onCvvBlur = (event: FocusEvent<HTMLInputElement>) => {
        setIsCardFlipped(false);
    };

    const handlePaymentSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const formEntries = Object.fromEntries(formData.entries()) as {
            addressNumber: FormDataEntryValue;
            birthDate: FormDataEntryValue;
            cardCvv: FormDataEntryValue;
            cardHolder: FormDataEntryValue;
            cardMonth: FormDataEntryValue;
            cardNumber: FormDataEntryValue;
            cardYear: FormDataEntryValue;
            cpfCnpj: FormDataEntryValue;
            city: FormDataEntryValue;
            complement: FormDataEntryValue;
            neighborhood: FormDataEntryValue;
            phone: FormDataEntryValue;
            postalCode: FormDataEntryValue;
            state: FormDataEntryValue;
            street: FormDataEntryValue;
        };

        const convertedValues = {
            ...formEntries,
            addressNumber: formEntries.addressNumber
                .toString()
                .replace(/\D/g, ''),
            birthDate: new Date(formEntries.birthDate.toString()),
            cardCvv: formEntries.cardCvv.toString().replace(/\D/g, ''),
            cardNumber: formEntries.cardNumber.toString().replace(/\D/g, ''),
            phone: formEntries.phone.toString().replace(/\D/g, ''),
            postalCode: formEntries.postalCode.toString().replace(/\D/g, ''),
            cpfCnpj: formEntries.cpfCnpj.toString().replace(/\D/g, ''),
        };

        try {
            setIsLoading(true);
            const { data, status } = await axios.post('/api/payment/', {
                cartId,
                paymentType: 'CREDIT_CARD',
                cardData: {
                    creditCard: {
                        holderName: convertedValues.cardHolder,
                        number: convertedValues.cardNumber,
                        expiryMonth: convertedValues.cardMonth,
                        expiryYear: convertedValues.cardYear,
                        ccv: convertedValues.cardCvv,
                    },
                    cardHolderInfo: {
                        name: convertedValues.cardHolder,
                        email: session!.user.email,
                        cpfCnpj: convertedValues.cpfCnpj,
                        postalCode: convertedValues.postalCode,
                        addressNumber: convertedValues.addressNumber,
                        phone: convertedValues.phone,
                    },
                },
                customer: {
                    internalId: session!.user.id,
                    name: session!.user.name,
                    cpfCnpj: convertedValues.cpfCnpj,
                    email: session!.user.email,
                    phone: session!.user.phone ?? convertedValues.phone,
                    address: {
                        street: convertedValues.street,
                        number: convertedValues.addressNumber,
                        complement: convertedValues.complement,
                        neighborhood: convertedValues.neighborhood,
                        zipCode: convertedValues.postalCode,
                    },
                },
            });
            setIsLoading(false);

            if (status !== 200) {
                throw new PaymentError(data.message, data.error, status);
            }

            onChangeStep?.('processing_payment', data);
        } catch (error) {
            let message =
                'Ih... Algo deu errado e nem sabemos o que é. Tente novamente mais tarde!';
            if (error instanceof PaymentError) {
                switch (error.statusCode) {
                    case 400:
                        message =
                            'Ops, algo está estranho com os dados do pagamento. Melhor dar uma conferida!';
                        break;
                    case 403:
                        message =
                            'Ué, onde foi parar esse pagamento? Não estamos encontrando aqui!';
                        break;
                    case 404:
                        message =
                            'Ops, parece que esse pagamento pegou o caminho errado. Não está por aqui!';
                        break;
                    default:
                        break;
                }
                console.error(error.cause);
            } else {
                console.error(error);
            }

            toast.error(message, {
                icon: <>🚨</>,
            });
            setIsLoading(false);
            return;
        }
    };

    useEffect(() => {
        const node = cardNumberRef.current;
        if (!node) {
            return;
        }
        let cursorIdx = cursorPositionRef.current;

        if (
            cardNumber.length > prevCardNumber.current.length &&
            cardNumber[cursorIdx - 1] === ' '
        ) {
            cursorIdx += 1;
        } else if (prevCardNumber.current[cursorIdx - 1] === ' ') {
            cursorIdx -= 1;
        }

        node.selectionStart = node.selectionEnd = cursorIdx;
    }, [cardNumber]);

    const [postalCode, setPostalCode] = useState('');
    const [street, setStreet] = useState('');
    const [addressNumber, setAddressNumber] = useState('');
    const [addressComplement, setAddressComplement] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');

    const handlePostalCodeComplete = async (value: string) => {
        try {
            const { data, status } = await axios.get<ViaCEPPostalCodeResponse>(
                `https://viacep.com.br/ws/${value}/json/`
            );

            if (status === 200) {
                setStreet(data.logradouro);
                setAddressNumber('');
                setAddressComplement('');
                setNeighborhood(data.bairro);
                setCity(data.localidade);
                setState(data.uf);
            }
        } catch (error) {
            toast.error('CEP inválido!', {
                icon: <>🚨</>,
            });
        }
    };

    return (
        <section {...props}>
            <div className={styles.rowPaymentCard}>
                <div className={styles.columnCard}>
                    <Card
                        cardHolder={cardHolder}
                        cardNumber={cardNumber}
                        cardMonth={cardMonth}
                        cardYear={cardYear}
                        cardCvv={cardCvv}
                        isCardFlipped={isCardFlipped}
                        currentFocusedElm={currentFocusedElm}
                        onCardElementClick={handleCardElementClick}
                    />
                    <div className={styles.blockInstructions}>
                        <div className={styles.instructionsRow}>
                            <div className={styles.borderOfCard}>
                                <CardIconwithBorder />
                            </div>
                            <div className={styles.columnInstructions}>
                                <h6>Pagar com Cartão</h6>
                                <p>
                                    Pague com <strong>Cartão</strong> e receba
                                    seus ingressos assim que confirmado! o
                                    pagamento é rápido e seguro {`:)`}
                                </p>
                            </div>
                        </div>
                        <div className={styles.descriptionColumn}>
                            <h4>Instruções de compra</h4>
                            <div className={styles.rowInformationwithIcon}>
                                <NotesIcon />
                                <text>
                                    Digite as informações do titular do cartão
                                    corretamente
                                </text>
                            </div>
                            <div className={styles.rowInformationwithIcon}>
                                <EyeIcon />
                                <text>
                                    Confira o evento escolhido e ingressos
                                    selecionados, em seguida aperte em Realizar
                                    Pagamento
                                </text>
                            </div>
                            <div className={styles.rowInformationwithIcon}>
                                <CheckWhite />
                                <text>
                                    Iremos processar seu pagamento e em seguida
                                    você receberá seus ingressos
                                </text>
                            </div>
                        </div>
                    </div>
                </div>
                <form
                    className={styles.cardFormContainer}
                    id="creditCardForm"
                    onSubmit={handlePaymentSubmit}
                >
                    <Input
                        label="Número do Cartão"
                        type="text"
                        name="cardNumber"
                        autoComplete="off"
                        onChange={onCardNumberChange}
                        maxLength={maxCardNumberLength}
                        pattern="^\d+(\s\d+)*$"
                        ref={cardNumberRef}
                        onFocus={(e) =>
                            handleCardFormInputFocus(e, 'cardNumber')
                        }
                        onBlur={handleCardInputBlur}
                        value={cardNumber}
                        required
                    />

                    <Input
                        label="Titular do Cartão"
                        type="text"
                        autoComplete="off"
                        name="cardHolder"
                        onChange={handleCardHolderChange}
                        value={cardHolder}
                        ref={cardHolderRef}
                        onFocus={(e) =>
                            handleCardFormInputFocus(e, 'cardHolder')
                        }
                        onBlur={handleCardInputBlur}
                        required
                    />

                    <div className={styles.extraInfoContainer}>
                        <DateSelect
                            label={'Mês/Ano'}
                            monthValue={cardMonth}
                            onCardMonthChange={handleCardMonthChange}
                            onCardMonthInputFocus={(e) =>
                                handleCardFormInputFocus(e, 'cardDate')
                            }
                            yearValue={cardYear}
                            onCardYearChange={handleCardYearChange}
                            onCardYearInputFocus={(e) =>
                                handleCardFormInputFocus(e, 'cardDate')
                            }
                            onInputBlur={handleCardInputBlur}
                            ref={cardDateRef}
                        />
                        <Input
                            label="CVV"
                            type="text"
                            pattern="\d*"
                            containerClassName={styles.cvvContainer}
                            maxLength={4}
                            autoComplete="off"
                            name="cardCvv"
                            onChange={handleCardCvvChange}
                            onFocus={onCvvFocus}
                            onBlur={onCvvBlur}
                            value={cardCvv}
                            required
                        />
                    </div>

                    <section className={styles.cardHolderInfo}>
                        <h3>Dados do Titular do Cartão</h3>

                        <div className={styles.dateInputContainer}>
                            <DatePicker
                                name="birthDate"
                                maxDate={new Date()}
                                locale="pt-BR"
                                required
                                value={birthDate}
                                onChange={(value) => {
                                    //@ts-ignore
                                    setBirthDate(value);
                                }}
                                className={styles.inputContainer}
                            />
                        </div>

                        <MaskedInput
                            type="text"
                            placeholder="CPF/CNPJ"
                            name="cpfCnpj"
                            pattern="\d*"
                            required
                            mask={[
                                {
                                    mask: '000.000.000-00',
                                },
                                {
                                    mask: '00.000.000/0000-00',
                                },
                            ]}
                            unmask={true}
                        />

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
                            unmask={true}
                        />
                    </section>
                    <section className={styles.addressContainer}>
                        <h3>Endereço do Titular do Cartão</h3>

                        <div className={styles.addressInputGrid}>
                            <MaskedInput
                                name="postalCode"
                                type="text"
                                placeholder="CEP"
                                mask={[
                                    {
                                        mask: '00.000-000',
                                    },
                                ]}
                                required
                                onComplete={handlePostalCodeComplete}
                                containerClassName={styles.fullWidth}
                                unmask={true}
                            />
                            <Input
                                type="text"
                                placeholder="Rua"
                                value={street}
                                required
                                disabled
                                containerClassName={styles.fullWidth}
                            />
                            <input type="hidden" name="street" value={street} />

                            <Input
                                name="addressNumber"
                                type="number"
                                pattern="\d*"
                                placeholder="Nº"
                                required
                            />

                            <Input
                                name="complement"
                                type="text"
                                placeholder="Complemento"
                                containerClassName={styles.fourFifth}
                            />

                            <Input
                                name="neighborhood"
                                type="text"
                                placeholder="Bairro"
                                value={neighborhood}
                                required
                                disabled
                                containerClassName={styles.fullWidth}
                            />
                            <input
                                type="hidden"
                                name="neighborhood"
                                value={neighborhood}
                            />

                            <Input
                                name="city"
                                type="text"
                                placeholder="Cidade"
                                value={city}
                                required
                                disabled
                                containerClassName={styles.fourFifthReverse}
                            />
                            <input type="hidden" name="city" value={city} />

                            <Input
                                name="state"
                                type="text"
                                placeholder="Estado"
                                value={state}
                                required
                                disabled
                            />
                            <input type="hidden" name="state" value={state} />
                        </div>
                    </section>
                </form>
            </div>

            <Button
                label="Pagar"
                isLoading={isLoading}
                type="submit"
                form="creditCardForm"
            />
        </section>
    );
};

export default CardPayment;
