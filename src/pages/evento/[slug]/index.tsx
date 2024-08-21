import Button from '@/components/Button';
import ArrowIcon from '@/icons/ArrowIcon';
import CartIcon from '@/icons/CartIcon';
import TelefoneIcon from '@/icons/TelefoneIcon';
import WhatsIcon from '@/icons/WhatsIcon';
import { getEventBySlug } from '@/server/db/events/getEventBySlug';
import styles from '@/styles/Checkout.module.scss';
import router from 'next/router';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import BatchCard from '@/components/BatchCard';
import { getCouponByCode } from '@/server/db/coupons/getCouponByCode';
import { EventData, OrganizerData } from '@/server/db/events/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface EventProps {
    eventData: Omit<EventData, 'organizerId' | 'startDate' | 'endDate'> & {
        startDateTimestamp: number;
        endDateTimestamp: number;
    };
    organizerData: OrganizerData;
}

export default function Evento({
    eventData,
    organizerData,
    couponData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const {
        id: eventId,
        name,
        startDateTimestamp,
        endDateTimestamp,
        address,
        description,
        batches,
        policy,
        bannerUrl,
        producer,
    } = eventData;
    const { data: session, status: sessionStatus } = useSession();

    const parsedDescription = () => {
        // Replace \n with <br />
        const regexURL =
            /((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?)(((\/\w+)+|\/?)$)?/g;

        const parsed = description
            .split(/(\\n)/g)
            .map((line: any, index: any) => {
                if (line === '\\n') {
                    return <br key={index} />;
                }
                if (line.length <= 0) {
                    return <br key={index} />;
                }
                // remove url from line
                const url = line.match(regexURL);
                if (url && url.length > 0) {
                    const urlIndex = line.indexOf(url[0]);
                    const urlLength = url[0].length;
                    const firstPart = line.slice(0, urlIndex);
                    const secondPart = line.slice(urlIndex + urlLength);
                    return (
                        <p key={index}>
                            {firstPart}
                            <a
                                href={url[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {url[0]}
                            </a>
                            {secondPart}
                        </p>
                    );
                }

                return <p key={index}>{line}</p>;
            });

        return parsed;
    };

    const {
        id: organizerId,
        contact: organizerContact,
        address: organizerAddress,
        name: organizerName,
        description: organizerDescription,
    } = organizerData;

    const [selectedTickets, setSelectedTickets] = useState<{
        couponId?: string;
        tickets: { [batchId: string]: number };
    }>({
        tickets: {},
        couponId: couponData?.isActive ? couponData.couponCode : undefined,
    });

    const [mapUrl, setMapUrl] = useState('');
    const [isLoadingCart, setIsLoadingCart] = useState(false);

    const [coupon, setCoupon] = useState(
        couponData?.isActive ? couponData : null
    );
    const [couponCode, setCouponCode] = useState(
        couponData?.isActive ? couponData.couponCode : ''
    );

    const startDate = new Date(startDateTimestamp);
    const endDate = new Date(endDateTimestamp);

    useEffect(() => {
        const fullAddress = `${address.street}, ${address.number} - ${address.postalCode}`;
        const newUrl = `https://www.google.com/maps?q=${fullAddress}&output=embed`;
        setMapUrl(newUrl);
    }, [address.number, address.postalCode, address.street]);

    const handleSelectTicket = (id: string, quantity: number) => {
        setSelectedTickets((prevSelectedTickets) => ({
            ...prevSelectedTickets,
            tickets: {
                ...prevSelectedTickets.tickets,
                [id]: quantity,
            },
        }));
    };

    const getToastTheme = () => {
        return window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'colored'
            : 'light';
    };

    const openGoogleMaps = () => {
        const fullAddress = `${address.street}, ${address.number} - ${address.postalCode}`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            fullAddress
        )}`;
        window.open(mapsUrl, '_blank');
    };

    useEffect(() => {
        if (couponData && couponData.isActive) {
            toast.success('Cupom de desconto aplicado!', {
                icon: '🎉',
                autoClose: 2500,
                theme: getToastTheme(),
            });
        }
    }, [couponData]);

    const handleNavigatePagar = async () => {
        if (sessionStatus === 'unauthenticated') {
            window.SignInModal.show();
            return;
        }

        if (Object.values(selectedTickets.tickets).length <= 0) {
            toast.error('Selecione pelo menos um ingresso!', {
                icon: '🚨',
                autoClose: 2500,
                theme: getToastTheme(),
            });
            return;
        }

        setIsLoadingCart(true);

        const { status, data } = await axios.post<{ cartId: string }>(
            '/api/cart/create',
            {
                eventId,
                selectedTickets: selectedTickets.tickets,
                couponId: selectedTickets.couponId,
            }
        );

        if (status !== 200) {
            toast.error('Erro ao criar carrinho!', {
                icon: '🚨',
                autoClose: 2500,
                theme: getToastTheme(),
            });
            setIsLoadingCart(false);
            return;
        }

        router.push({
            pathname: `${router.asPath}/carrinho/${data.cartId}`,
        });
    };

    const handleFinalizePurchase = async () => {
        if (sessionStatus === 'unauthenticated') {
            window.SignInModal.show();
            return;
        }

        if (Object.values(selectedTickets.tickets).length <= 0) {
            toast.error('Selecione pelo menos um ingresso!', {
                icon: '🚨',
                autoClose: 2500,
                theme: getToastTheme(),
            });
            return;
        }

        setIsLoadingCart(true);

        const { status, data } = await axios.post<{ cartId: string }>(
            '/api/cart/create',
            {
                eventId,
                selectedTickets: selectedTickets.tickets,
                couponId: coupon?.isActive
                    ? selectedTickets.couponId
                    : undefined,
            }
        );

        if (status !== 200) {
            toast.error('Erro ao criar carrinho!', {
                icon: '🚨',
                autoClose: 2500,
                theme: getToastTheme(),
            });
            setIsLoadingCart(false);
            return;
        }

        router.push({
            pathname: `${router.asPath}/carrinho/${data.cartId}`,
        });
    };

    const handleChangeCouponCode = (e: ChangeEvent<HTMLInputElement>) => {
        setCouponCode(e.target.value.trim());
    };

    const handleApplyCoupon = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const formEntries = Object.fromEntries(formData.entries()) as {
            couponCode: FormDataEntryValue;
        };

        const couponCode = formEntries.couponCode;

        if (!couponCode || couponCode.toString().length <= 0) {
            return;
        }
        try {
            const { status, data } = await axios.post<{
                discount: number;
                type: 'percent' | 'fixed';
                couponCode: string;
                isActive: boolean;
            }>('/api/coupons/apply', {
                eventId,
                couponCode,
            });

            if (status !== 200 || !data.isActive) {
                toast.error('O cupom não existe!', {
                    icon: '🚨',
                    autoClose: 2500,
                    theme: getToastTheme(),
                });
                return;
            }
            setCoupon(data);
            setSelectedTickets((prevSelectedTickets) => ({
                ...prevSelectedTickets,
                couponId: data.couponCode,
            }));
            toast.success('Cupom de desconto aplicado!', {
                icon: '🎉',
                autoClose: 2500,
                theme: getToastTheme(),
            });
        } catch (error) {
            toast.error('O cupom não existe!', {
                icon: '🚨',
                autoClose: 2500,
                theme: getToastTheme(),
            });
            return;
        }
    };

    // const upcomingEvents = [
    //     {
    //         imageSrc: '/bannerEvent.webp',
    //         name: 'Gaab na Shed',
    //         date: '10 de novembro de 2023',
    //     },
    //     {
    //         imageSrc: '/bannerEvent2.webp',
    //         name: 'MC Davi na Shed Curitiba',
    //         date: '10 de novembro de 2023',
    //     },
    //     {
    //         imageSrc: '/bannerEvent3.webp',
    //         name: 'MC PH na Shed Curitiba',
    //         date: '10 de novembro de 2023',
    //     },
    // ];

    const totalBasePrice = Object.entries(selectedTickets.tickets).reduce(
        (acc, [batchId, quantity]) => {
            const batch = batches.find((batch: any) => batch.id === batchId);

            if (!batch) {
                return acc;
            }

            return acc + batch.price * quantity;
        },
        0
    );

    const discountedPrice = coupon
        ? coupon.type === 'fixed'
            ? totalBasePrice - coupon.discount
            : totalBasePrice * (1 - coupon.discount / 100)
        : totalBasePrice;

    const totalPrice = (
        discountedPrice > 0 ? discountedPrice : 0
    ).toLocaleString('pt-BR', {
        currency: 'BRL',
        style: 'currency',
    });
    const totalTickets = Object.values(selectedTickets.tickets).reduce(
        (acc, quantity) => acc + quantity,
        0
    );

    return (
        <>
            {totalTickets > 0 && (
                <div className={styles.modalCart}>
                    <div className={styles.modalCartContent}>
                        <div className={styles.leftSideCart}>
                            <CartIcon />
                            <div className={styles.priceBlock}>
                                <p>{totalPrice}</p>
                                <span>
                                    {totalTickets} Ingresso
                                    {totalTickets > 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        <div className={styles.rightSideCart}>
                            <Button
                                label="Finalizar"
                                size="small"
                                isLoading={isLoadingCart}
                                onClick={handleNavigatePagar}
                            />
                        </div>
                    </div>
                </div>
            )}
            <section className={styles.container}>
                <div className={styles.detalhesEvento}>
                    <div className={styles.headerEvento}>
                        <Link href="/" onClick={router.back}>
                            <ArrowIcon />
                        </Link>
                        <p>Detalhes do evento</p>
                    </div>
                    <img
                        className={styles.bannerCheckoutBackground}
                        src={bannerUrl}
                    />
                    <img className={styles.bannerCheckout} src={bannerUrl} />
                    <div className={styles.detailsBlock}>
                        <div className={styles.dateEventBlock}>
                            <h3>{name}</h3>
                            <div className={styles.calendarRowIcon}>
                                <div className={styles.calendarIcon}>
                                    <div className={styles.headerCalendarIcon}>
                                        <p>Dia</p>
                                    </div>
                                    <div className={styles.bodyCalendarIcon}>
                                        <p>{startDate.getDate()}</p>
                                    </div>
                                </div>
                                <p>{`${startDate.toLocaleString('pt-BR', {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                })}`}</p>
                            </div>

                            <div className={styles.descriptionBlockDesktop}>
                                <p>Descrição</p>
                                <hr />
                                <div className={styles.richTextblock}>
                                    <p>{producer.name} Apresenta</p>
                                    <p>{name}</p>
                                    <p>
                                        📍 {address.street} {address.number}
                                    </p>
                                    <p>
                                        ⏰{' '}
                                        {startDate.toLocaleString('pt-BR', {
                                            timeStyle: 'short',
                                        })}{' '}
                                        {endDate.toLocaleString('pt-BR', {
                                            timeStyle: 'short',
                                        })}
                                    </p>
                                    <p>ATRAÇÕES:</p>
                                    <section>{parsedDescription()}</section>
                                </div>
                            </div>
                        </div>
                        <hr />

                        <div className={styles.buyBlock}>
                            <div className={styles.titleBlockBuyBlock}>
                                <p>Selecione um ingresso para comprar</p>
                            </div>
                            <div className={styles.cupomBlock}>
                                <div className={styles.leftSideCupomBlock}>
                                    <span>Possui algum cupom?</span>
                                    {coupon && coupon.isActive && (
                                        <p>
                                            Cupom aplicado: {coupon.couponCode}
                                        </p>
                                    )}
                                </div>
                                <form
                                    className={styles.rightSideCupomBlock}
                                    onSubmit={handleApplyCoupon}
                                >
                                    <input
                                        name="couponCode"
                                        placeholder="Seu código"
                                        type="text"
                                        value={couponCode}
                                        onChange={handleChangeCouponCode}
                                    />
                                    <Button
                                        type="submit"
                                        label="Aplicar"
                                        size="x-small"
                                    />
                                </form>
                            </div>

                            <div className={styles.buyTicketWrap}>
                                {batches.map((batch: any) => (
                                    <BatchCard
                                        key={batch.id}
                                        batch={batch}
                                        coupon={coupon}
                                        onSelectTicket={handleSelectTicket}
                                    />
                                ))}

                                <Button
                                    label="Comprar Ingresso"
                                    isLoading={isLoadingCart}
                                    onClick={handleFinalizePurchase}
                                />
                                <div className={styles.mapBlockDesktop}>
                                    <div className={styles.leftSide}>
                                        <div className={styles.locationWrap}>
                                            <p>
                                                Data:{' '}
                                                {startDate.toLocaleString(
                                                    'pt-BR',
                                                    {
                                                        dateStyle: 'short',
                                                    }
                                                )}
                                            </p>
                                            <p>
                                                Endereço: {address.street},{' '}
                                                {address.number} -{' '}
                                                {address.postalCode.slice(0, 5)}
                                                -
                                                {address.postalCode.slice(5, 8)}
                                            </p>
                                        </div>
                                        <Button
                                            label={'Abrir Rota'}
                                            size="small"
                                            onClick={openGoogleMaps}
                                        />
                                    </div>
                                    <div className={styles.rightSide}>
                                        <iframe
                                            src={mapUrl}
                                            width="600"
                                            height="450"
                                        ></iframe>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.descriptionBlock}>
                    <p>Descrição</p>
                    <hr />
                    <div className={styles.richTextblock}>
                        <p>{producer.name} Apresenta</p>
                        <p>{name}</p>
                        <p>
                            📍 {address.street} {address.number}
                        </p>
                        <p>
                            ⏰{' '}
                            {startDate.toLocaleString('pt-BR', {
                                timeStyle: 'short',
                            })}{' '}
                            {endDate.toLocaleString('pt-BR', {
                                timeStyle: 'short',
                            })}
                        </p>
                        <p>ATRAÇÕES:</p>
                        <section>{parsedDescription()}</section>
                    </div>
                </div>

                <div className={styles.moreProductsDescription}>
                    <div className={styles.enderecoBlock}>
                        <p>
                            Endereço: {address.street} {address.number}{' '}
                        </p>
                        <p>INFORMAÇÕES E RESERVAS: {organizerContact.phone}</p>
                    </div>
                </div>

                <div className={styles.mapBlock}>
                    <div className={styles.leftSide}>
                        <div className={styles.locationWrap}>
                            <p>
                                {startDate.toLocaleString('pt-BR', {
                                    dateStyle: 'short',
                                })}
                            </p>
                            <p>
                                {address.street}, {address.number} -{' '}
                                {address.postalCode.slice(0, 5)}-
                                {address.postalCode.slice(5, 8)}
                            </p>
                        </div>
                        <Button
                            label={'Abrir Rota'}
                            size="small"
                            onClick={openGoogleMaps}
                        />
                    </div>
                    <div className={styles.rightSide}>
                        <iframe src={mapUrl} width="600" height="450"></iframe>
                    </div>
                </div>

                <div className={styles.contactPart}>
                    <p>Entre em contato com a empresa</p>
                    <hr className={styles.firstHr} />
                    <p>{producer.name}</p>
                    <div className={styles.whatsRow}>
                        <WhatsIcon />

                        <div className={styles.whatsRowColumn}>
                            <span>WhatsApp</span>
                            <a
                                href={`https://api.whatsapp.com/send?phone=55${organizerContact.whatsapp}`}
                            >
                                {organizerContact.whatsapp}
                            </a>
                        </div>
                    </div>
                    <hr />
                </div>

                <div className={styles.politicaSection}>
                    {/* <h3>Política do Evento</h3>
                    <div className={styles.informationBlock}>
                        <p>Cancelamento de pedidos pagos</p>
                        <p>{policy} </p>
                        <span>Saiba mais sobre o cancelamento</span>
                    </div> */}

                    {/* <div className={styles.mapNextEvents}>
                        <h3>Próximos eventos</h3>
                        {upcomingEvents.map((event, index) => (
                            <div key={index} className={styles.nextEventBlock}>
                                <img
                                    src={event.imageSrc}
                                    alt={`Evento: ${event.name}`}
                                />
                                <div className={styles.footerEventBlock}>
                                    <p>{event.name}</p>
                                    <span>{event.date}</span>
                                </div>
                            </div>
                        ))}
                    </div> */}
                    <div className={styles.footerNextEvents}>
                        <p>Precisa de ajuda?</p>
                        <div className={styles.rowContact}>
                            <div className={styles.contactRowFooter}>
                                <TelefoneIcon />
                                <div className={styles.blockContactRow}>
                                    <p>Contato Comercial</p>
                                    <a href={`tel:4192161070`}>4192161070</a>
                                </div>
                            </div>
                            <div className={styles.contactRowFooter}>
                                <WhatsIcon />
                                <div className={styles.blockContactRow}>
                                    <p>WhatsApp</p>
                                    <a
                                        href={`https://api.whatsapp.com/send?phone=554192161070`}
                                    >
                                        4192161070
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
export const getServerSideProps = (async (context: any) => {
    const { slug } = context.params as {
        slug: string;
    };

    const { c, C, lote } = context.query as {
        c?: string;
        C?: string;
        lote?: string;
    };

    if (!slug) {
        return { notFound: true };
    }

    try {
        const event = await getEventBySlug(slug);
        const eventId = event.eventData.id;

        if (!event.eventData.isVisible) {
            return {
                notFound: true,
            };
        }

        event.eventData.batches = event.eventData.batches.filter((batch) => {
            if (batch.type === 'PUBLIC') return true;
            if (lote) {
                if (batch.type === 'PRIVATE' && batch.id === lote) return true;
            }
            return false;
        });

        let couponData = null;

        if (c) {
            try {
                couponData = await getCouponByCode(eventId, c);
            } catch (error) {
                console.error('Erro ao buscar cupom:', error);
            }
        } else if (C) {
            try {
                couponData = await getCouponByCode(eventId, C);
            } catch (error) {
                console.error('Erro ao buscar cupom:', error);
            }
        }

        return {
            props: { ...event, couponData },
        };
    } catch (error) {
        console.error('Erro ao buscar evento:', error);

        return {
            notFound: true,
        };
    }
}) satisfies GetServerSideProps<EventProps>;
