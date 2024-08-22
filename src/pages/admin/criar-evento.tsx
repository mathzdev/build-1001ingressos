import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import styles from '../../styles/CriarEvento.module.scss';
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading...</p>,
});

import Button from '@/components/Button';
import ModalCreateTicket from '@/components/admin/Modals/ModalCreateTicket';
import DashboardLayout from '@/layouts/DashboardLayout';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import dynamic from 'next/dynamic';
import { ReactElement } from 'react';
import { toast } from 'react-toastify';
import { NextPageWithLayout } from '../_app';
import { authOptions } from '../api/auth/[...nextauth]';

const CriarEvento: NextPageWithLayout = () => {
    const router = useRouter();

    const [organizerId, setOrganizerId] = useState('Ih3xzbDaNXZrLSd7pl3y');
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [time, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [address, setAddress] = useState({
        street: '',
        number: '',
        postalCode: '',
        complement: '',
    });
    const [description, setDescription] = useState('');
    const [batches, setBatches] = useState([]);
    const [policy, setPolicy] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');
    const [category, setCategory] = useState('');
    const [producer, setProducer] = useState({ name: '', description: '' });
    const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState('publico');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const createSlug = (name: any) => {
        return name.toLowerCase().replace(/\s+/g, '-');
    };

    const validateEventFields = () => {
        if (!hasAgreedToTerms) {
            return 'Por favor, concorde com os termos antes de prosseguir.';
        }
        if (!organizerId) {
            return 'Por favor, preencha o ID do organizador.';
        }
        if (!name) {
            return 'Por favor, preencha o nome do evento.';
        }
        if (!date) {
            return 'Por favor, selecione a data de início do evento.';
        }
        if (!time) {
            return 'Por favor, preencha a hora de início do evento.';
        }
        if (!endDate) {
            return 'Por favor, selecione a data de término do evento.';
        }
        if (!endTime) {
            return 'Por favor, preencha a hora de término do evento.';
        }
        if (!address.street || !address.number || !address.postalCode) {
            return 'Por favor, preencha todos os campos do endereço.';
        }
        if (!description) {
            return 'Por favor, forneça uma descrição para o evento.';
        }
        if (!selectedImage) {
            return 'Por favor, selecione uma imagem para o banner do evento.';
        }
        if (!isVisible) {
            return 'Por favor, selecione uma opção de visibilidade para o evento.';
        }

        return '';
    };

    const getToastTheme = () => {
        return window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'colored'
            : 'light';
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const errorMessage = validateEventFields();
        const imageUrl = await uploadImage(formData);

        if (errorMessage) {
            toast.error(errorMessage, {
                icon: '🚨',
                theme: getToastTheme(),
            });
            return;
        }

        try {
            const imageUrl = await uploadImage(formData);
            setBannerUrl(imageUrl);

            const eventData = {
                organizerId,
                name,
                slug: createSlug(name),
                date,
                time,
                endDate,
                endTime,
                address,
                description,
                batches,
                policy,
                bannerUrl: imageUrl,
                category,
                producer,
                isVisible,
            };

            const response = await fetch('/api/events/addEvent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData),
            });

            if (response.ok) {
                alert('Evento cadastrado com sucesso!');
                router.push('/admin/meus-eventos');
            } else {
                throw new Error('Falha ao cadastrar evento');
            }
        } catch (error) {
            console.error('Erro ao cadastrar o evento:', error);
        }
    };

    const handleClick = () => {
        const imageUploadElement = document.getElementById('imageUpload');
        if (imageUploadElement) {
            imageUploadElement.click();
        }
    };

    const uploadImage = async (formData: FormData) => {
        try {
            const uploadResponse = await fetch('/api/upload/uploadImage', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Erro ao enviar o arquivo');
            }

            const data = await uploadResponse.json();
            return data.imageUrl; // Ajuste de acordo com a resposta do seu backend
        } catch (error) {
            console.error('Erro ao enviar o arquivo:', error);
        }
    };

    const handleImageUpload = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);

            console.log(reader);
        }
    };

    const formatPostalCode = (value: string) => {
        // Remove tudo o que não for dígito
        let formattedValue = value.replace(/\D/g, '');

        // Insere o hífen entre o quinto e o sexto dígitos
        if (formattedValue.length > 5) {
            formattedValue = formattedValue.replace(/^(\d{5})(\d+)/, '$1-$2');
        }

        // Limita o tamanho do CEP a 10 caracteres para incluir os 8 dígitos e o hífen
        return formattedValue.substring(0, 10);
    };

    const handlePostalCodeChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const formattedValue = formatPostalCode(event.target.value);
        setAddress({
            ...address,
            postalCode: formattedValue,
        });

        if (formattedValue.length > 8) {
            try {
                console.log(formattedValue);
                const response = await axios.get(
                    `https://viacep.com.br/ws/${formattedValue.replace(
                        '-',
                        ''
                    )}/json/`
                );
                if (!response.data.erro) {
                    setAddress({
                        ...address,
                        street: response.data.logradouro,
                        complement: response.data.complemento,
                        postalCode: formattedValue,
                    });
                }
            } catch (error) {
                console.error('Erro ao buscar dados do CEP', error);
            }
        }
    };

    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [
                { list: 'ordered' },
                { list: 'bullet' },
                { indent: '-1' },
                { indent: '+1' },
            ],
            ['link', 'image', 'video'],
            [{ script: 'sub' }, { script: 'super' }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ['clean'],
        ],
    };

    const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
        'image',
        'video',
        'script',
        'sub',
        'super',
        'color',
        'background',
        'align',
    ];

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const handleOpenModal = () => {
        setIsModalVisible(true);
    };

    return (
        <>
            {isModalVisible && (
                <ModalCreateTicket
                    handleClose={handleCloseModal}
                    batches={[]}
                    eventId={''}
                />
            )}
            <main className={styles.container}>
                <div className={styles.container}>
                    <header className={styles.header}>
                        <h1>
                            Criar <strong> Evento Presencial</strong>
                        </h1>
                        <div className={styles.buttonsContainer}>
                            <Button
                                label="Publicar evento"
                                type="submit"
                                form="createEventForm"
                                variant="admin"
                                size="small"
                            />
                            <Button
                                label="Pré-visualizar"
                                variant="admin"
                                size="small"
                            />
                        </div>
                    </header>
                    <article>
                        <form onSubmit={handleSubmit} id="createEventForm">
                            <div className={styles.content}>
                                <div className={styles.participantsData}>
                                    <div className={styles.headContent}>
                                        <p className={styles.resumeTitle}>
                                            1. Onde o seu evento vai acontecer?
                                        </p>
                                    </div>
                                    <div className={styles.searchContainer}>
                                        <div className={styles.right}>
                                            <div
                                                className={
                                                    styles.inputContainer
                                                }
                                            >
                                                <p
                                                    className={
                                                        styles.selectTitle
                                                    }
                                                >
                                                    CEP
                                                </p>
                                                <input
                                                    type="text"
                                                    className={
                                                        styles.selectField
                                                    }
                                                    placeholder="00000-000"
                                                    value={address.postalCode}
                                                    onChange={
                                                        handlePostalCodeChange
                                                    }
                                                />
                                            </div>
                                            <div
                                                className={
                                                    styles.inputContainer
                                                }
                                            >
                                                <p
                                                    className={
                                                        styles.selectTitle
                                                    }
                                                >
                                                    Av. / Rua
                                                </p>
                                                <input
                                                    type="text"
                                                    className={
                                                        styles.selectField
                                                    }
                                                    placeholder="Av. / Rua"
                                                    value={address.street}
                                                    onChange={(e) =>
                                                        setAddress({
                                                            ...address,
                                                            street: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div
                                                className={
                                                    styles.inputContainer
                                                }
                                            >
                                                <p
                                                    className={
                                                        styles.selectTitle
                                                    }
                                                >
                                                    Número
                                                </p>
                                                <input
                                                    type="number"
                                                    className={
                                                        styles.selectField
                                                    }
                                                    placeholder="Número"
                                                    value={address.number}
                                                    onChange={(e) =>
                                                        setAddress({
                                                            ...address,
                                                            number: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div
                                                className={
                                                    styles.inputContainer
                                                }
                                            >
                                                <p
                                                    className={
                                                        styles.selectTitle
                                                    }
                                                >
                                                    Complemento
                                                </p>
                                                <input
                                                    type="text"
                                                    className={
                                                        styles.selectField
                                                    }
                                                    placeholder="Complemento"
                                                    value={address.complement}
                                                    onChange={(e) =>
                                                        setAddress({
                                                            ...address,
                                                            complement:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.imageContainer}>
                                            <p className={styles.mapDesc}>
                                                Defina os campos CEP e Av./Rua
                                                para ter o endereço exibido
                                            </p>
                                            <iframe
                                                className={styles.iframeMaps}
                                                loading="lazy"
                                                allowFullScreen
                                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAVs1jB50vny6rur0HoTIXMYcr5MXfwT6E&q=${encodeURIComponent(
                                                    address.street +
                                                        ', ' +
                                                        address.postalCode
                                                )}`}
                                            ></iframe>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.participantsData}>
                                    <div className={styles.headContent}>
                                        <p className={styles.resumeTitle}>
                                            2. Informações básicas
                                        </p>
                                    </div>
                                    <div className={styles.searchContainer}>
                                        <div className={styles.rightA}>
                                            <input
                                                type="text"
                                                className={styles.selectField}
                                                placeholder="Nome do evento"
                                                value={name}
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                            />
                                            <div
                                                className={
                                                    styles.inputContainer
                                                }
                                            >
                                                <p
                                                    className={
                                                        styles.selectTitle
                                                    }
                                                >
                                                    Foto de divulgação
                                                    (opcional)
                                                </p>
                                                <div className={styles.midle}>
                                                    <img
                                                        src={
                                                            selectedImage ||
                                                            bannerUrl ||
                                                            '/upload.svg'
                                                        }
                                                        alt="Upload"
                                                        onClick={handleClick}
                                                        className={
                                                            styles.uploadImage
                                                        }
                                                    />
                                                    <p
                                                        className={
                                                            styles.inputDesc
                                                        }
                                                    >
                                                        A dimensão recomendada é
                                                        de{' '}
                                                        <strong>
                                                            1600 x 838
                                                        </strong>{' '}
                                                        (mesma proporção do
                                                        formato utilizado nas
                                                        páginas de evento no{' '}
                                                        <strong>
                                                            Facebook
                                                        </strong>{' '}
                                                        ). Formato{' '}
                                                        <strong>
                                                            JPEG, GIF ou PNG de
                                                            no máximo 2MB
                                                        </strong>{' '}
                                                        . Imagens com dimensões
                                                        diferentes serão
                                                        redimensionadas.
                                                    </p>
                                                    <input
                                                        type="file"
                                                        name="bannerImage"
                                                        id="imageUpload"
                                                        accept="image/*"
                                                        style={{
                                                            display: 'none',
                                                        }}
                                                        onChange={
                                                            handleImageUpload
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div
                                                className={
                                                    styles.inputContainer
                                                }
                                            >
                                                <p
                                                    className={
                                                        styles.selectTitle
                                                    }
                                                >
                                                    Classifique seu evento
                                                </p>
                                                <div
                                                    className={
                                                        styles.midleAssunto
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.inputContainer
                                                        }
                                                    >
                                                        <p
                                                            className={
                                                                styles.selectTitle
                                                            }
                                                        >
                                                            Assunto
                                                        </p>
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.rowEventInput
                                                        }
                                                    >
                                                        <input
                                                            type="text"
                                                            className={
                                                                styles.selectField
                                                            }
                                                            placeholder="Assunto do evento"
                                                        />
                                                        <select
                                                            className={
                                                                styles.selectField
                                                            }
                                                            value={category}
                                                            onChange={(e) =>
                                                                setCategory(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            // placeholder="Categoria do evento"
                                                        >
                                                            <option
                                                                value=""
                                                                disabled
                                                            >
                                                                Categoria do
                                                                evento
                                                            </option>
                                                            <option value="Sertanejo">
                                                                Sertanejo
                                                            </option>
                                                            <option value="Funk">
                                                                Funk
                                                            </option>
                                                            <option value="Pagode">
                                                                Pagode
                                                            </option>
                                                            <option value="Eletronica">
                                                                Eletrônica
                                                            </option>
                                                            <option value="Trap">
                                                                Trap
                                                            </option>
                                                            <option value="Samba">
                                                                Samba
                                                            </option>
                                                            <option value="Pop">
                                                                Pop
                                                            </option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.participantsData}>
                                    <p className={styles.resumeTitle}>
                                        3. Descrição do evento
                                    </p>
                                    <div className={styles.rightMessage}>
                                        {/*@ts-ignore*/}
                                        <ReactQuill
                                            theme="snow"
                                            value={description}
                                            onChange={setDescription}
                                            modules={modules}
                                            formats={formats}
                                        />
                                    </div>
                                </div>
                                <div className={styles.participantsData}>
                                    <div className={styles.headContent}>
                                        <p className={styles.resumeTitle}>
                                            4. Data e horário
                                        </p>
                                    </div>
                                    <div className={styles.midleF}>
                                        <div>
                                            <p className={styles.selectTitle}>
                                                Data de inicio
                                            </p>
                                            <div className={styles.dataItem}>
                                                <img
                                                    src="/purpleCalendar.svg"
                                                    alt=""
                                                />
                                                <input
                                                    type="date"
                                                    value={date}
                                                    onChange={(e) =>
                                                        setDate(e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <p className={styles.selectTitle}>
                                                Hora de início
                                            </p>
                                            <div className={styles.dataItem}>
                                                <img
                                                    src="/purpleClock.svg"
                                                    alt=""
                                                />
                                                <input
                                                    type="time"
                                                    value={time}
                                                    onChange={(e) =>
                                                        setStartTime(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <p className={styles.selectTitle}>
                                                Data de término
                                            </p>
                                            <div className={styles.dataItem}>
                                                <img
                                                    src="/calendar.svg"
                                                    alt=""
                                                />
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) =>
                                                        setEndDate(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <p className={styles.selectTitle}>
                                                Hora de término
                                            </p>
                                            <div className={styles.dataItem}>
                                                <img
                                                    src="/purpleClock.svg"
                                                    alt=""
                                                />
                                                <input
                                                    type="time"
                                                    value={endTime}
                                                    onChange={(e) =>
                                                        setEndTime(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.participantsData}>
                                    <div className={styles.headContent}>
                                        <p className={styles.resumeTitle}>
                                            5. Ingressos
                                        </p>
                                    </div>
                                    <div className={styles.midleC}>
                                        <p>
                                            Que tipo de ingresso você deseja
                                            criar?
                                        </p>
                                        <div className={styles.ticketType}>
                                            <Button
                                                className={styles.ticketButton}
                                                onClick={handleOpenModal}
                                                type="button"
                                                variant="admin"
                                                size="small"
                                                label="Ingresso pago"
                                            />
                                            <Button
                                                className={styles.ticketButton}
                                                onClick={handleOpenModal}
                                                type="button"
                                                variant="admin"
                                                size="small"
                                                label="Ingresso gratuito"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.midle}>
                                        <div className={styles.inputContainer}>
                                            <p className={styles.selectTitle}>
                                                Configurações
                                            </p>
                                            <div className={styles.midle}>
                                                <input type="checkbox" />
                                                <p
                                                    className={
                                                        styles.selectTitle
                                                    }
                                                >
                                                    Absorver a taxa de serviço
                                                </p>
                                            </div>
                                        </div>
                                        <div className={styles.inputContainer}>
                                            <p className={styles.selectTitle}>
                                                Nomenclatura
                                            </p>
                                            <input
                                                type="text"
                                                className={styles.selectField}
                                                placeholder="Ingresso"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.participantsData}>
                                    <div className={styles.headContent}>
                                        <p className={styles.resumeTitle}>
                                            6. Sobre o produtor
                                        </p>
                                    </div>
                                    <div className={styles.rightA}>
                                        <div className={styles.inputContainer}>
                                            <p className={styles.selectTitle}>
                                                Nome do produtor
                                            </p>
                                            <input
                                                type="text"
                                                className={styles.selectField}
                                                placeholder="Nome do produtor"
                                                value={producer.name}
                                                onChange={(e) =>
                                                    setProducer({
                                                        ...producer,
                                                        name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className={styles.inputContainer}>
                                            <p className={styles.selectTitle}>
                                                Descrição do produtor
                                            </p>
                                            <input
                                                type="text"
                                                className={styles.selectField}
                                                placeholder="Descrição do produtor"
                                                value={producer.description}
                                                onChange={(e) =>
                                                    setProducer({
                                                        ...producer,
                                                        description:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.participantsData}>
                                    <div className={styles.headContent}>
                                        <p className={styles.resumeTitle}>
                                            7. Responsabilidades
                                        </p>
                                    </div>
                                    <div className={styles.midleE}>
                                        <input
                                            type="radio"
                                            checked={hasAgreedToTerms}
                                            onChange={() =>
                                                setHasAgreedToTerms(
                                                    !hasAgreedToTerms
                                                )
                                            }
                                        />
                                        <p className={styles.descResp}>
                                            Ao publicar este evento, estou de
                                            acordo com os{' '}
                                            <span>Termos de uso</span>, com as{' '}
                                            <span>
                                                Diretrizes de Comunidade
                                            </span>{' '}
                                            e com o{' '}
                                            <span>
                                                Acordo de Processamento de Dados
                                            </span>{' '}
                                            , bem como declaro estar ciente da{' '}
                                            <span>Política de Privacidade</span>
                                            , da{' '}
                                            <span>Política de Cookies</span> e
                                            das{' '}
                                            <span>Obrigatoriedades Legais</span>
                                            .
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.midleEnd}>
                                    <div className={styles.midleV}>
                                        <p>
                                            <strong>
                                                Visibilidade do evento:
                                            </strong>
                                        </p>
                                        <div className={styles.midle}>
                                            <input
                                                type="radio"
                                                name="eventVisibility"
                                                value="publico"
                                                onChange={(e) =>
                                                    setIsVisible(e.target.value)
                                                }
                                                checked={
                                                    isVisible === 'publico'
                                                }
                                            />
                                            <p className={styles.selectTitle}>
                                                Público
                                            </p>
                                        </div>
                                        <div className={styles.midle}>
                                            <input
                                                type="radio"
                                                name="eventVisibility"
                                                value="privado"
                                                onChange={(e) =>
                                                    setIsVisible(e.target.value)
                                                }
                                                checked={
                                                    isVisible === 'privado'
                                                }
                                            />
                                            <p className={styles.selectTitle}>
                                                Privado
                                            </p>
                                        </div>
                                    </div>
                                    <div className={styles.buttons}>
                                        <Button
                                            className={styles.endButton}
                                            type="submit"
                                            variant="admin"
                                            size="small"
                                            label="Publicar evento"
                                        />
                                        <Button
                                            className={styles.endButton}
                                            variant="admin"
                                            size="small"
                                            label="Pré-visualizar"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </article>
                </div>
            </main>
        </>
    );
};

CriarEvento.getLayout = function getLayout(page: ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default CriarEvento;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    );

    if (!session) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }

    const isAdmin = session.user.roleId === 'X0v3WRX84lSVCK6wsRM5';

    if (!session.user.roleId) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }

    if (!isAdmin) {
        return {
            redirect: {
                destination: '/admin',
                permanent: false,
            },
        };
    }

    return {
        props: {},
    };
};
