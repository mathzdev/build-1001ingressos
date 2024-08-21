import Button from '@/components/Button';
import Input from '@/components/Inputs/Input';
import MaskedInput from '@/components/Inputs/MaskedInput';
import { CheckoutStep } from '@/pages/evento/[slug]/carrinho/[cartId]';
import { PaymentError } from '@/server/paymentGateways/error';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { FormEvent, HTMLAttributes, useState } from 'react';
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

interface PixPaymentProps extends HTMLAttributes<HTMLDivElement> {
    cartId: string;
    onChangeStep?: (step: CheckoutStep, payload?: any) => void;
}

const PixPayment = ({ cartId, onChangeStep, ...props }: PixPaymentProps) => {
    const { data: session } = useSession();

    const [isLoading, setIsLoading] = useState(false);

    const handlePaymentSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const formEntries = Object.fromEntries(formData.entries()) as {
            addressNumber: FormDataEntryValue;
            cpfCnpj: FormDataEntryValue;
            city: FormDataEntryValue;
            complement: FormDataEntryValue;
            neighborhood: FormDataEntryValue;
            postalCode: FormDataEntryValue;
            state: FormDataEntryValue;
            street: FormDataEntryValue;
        };

        const convertedValues = {
            ...formEntries,
            addressNumber: formEntries.addressNumber
                .toString()
                .replace(/\D/g, ''),
            postalCode: formEntries.postalCode.toString().replace(/\D/g, ''),
            cpfCnpj: formEntries.cpfCnpj.toString().replace(/\D/g, ''),
        };

        try {
            setIsLoading(true);
            const { data, status } = await axios.post('/api/payment/', {
                cartId,
                paymentType: 'PIX',
                customer: {
                    internalId: session!.user.id,
                    name: session!.user.name,
                    cpfCnpj: convertedValues.cpfCnpj,
                    email:
                        session!.user.email === 'thihxm@gmail.com'
                            ? 'thihxm+1@gmail.com'
                            : session!.user.email,
                    phone: session!.user.phone,
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
                icon: '🚨',
            });
            setIsLoading(false);
            return;
        }
    };

    const [postalCode, setPostalCode] = useState('');
    const [addressNumber, setAddressNumber] = useState('');
    const [addressComplement, setAddressComplement] = useState('');

    const [street, setStreet] = useState('');
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
                icon: '🚨',
            });
        }
    };

    return (
        <section {...props}>
            <form
                className={styles.cardFormContainer}
                id="pixForm"
                onSubmit={handlePaymentSubmit}
            >
                <section className={styles.cardHolderInfo}>
                    <h3>Dados do Comprador</h3>

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
                </section>
                <section className={styles.addressContainer}>
                    <h3>Endereço de Cobrança</h3>

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

            <Button
                label="Pagar"
                isLoading={isLoading}
                type="submit"
                form="pixForm"
            />
        </section>
    );
};

export default PixPayment;
