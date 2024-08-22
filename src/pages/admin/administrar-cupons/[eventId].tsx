import AdminCard from '@/components/admin/AdminCard';
import NotFoundContainer from '@/components/admin/NotFoundCoupon';
import AdminEventLayout from '@/layouts/AdminEventLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import { NextPageWithLayout } from '@/pages/_app';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getAllCouponsByEventId } from '@/server/db/coupons/getAllCouponsByEventId';
import { getUsedCouponsByEventId } from '@/server/db/coupons/getUsedCoupons';
import { getEventById } from '@/server/db/events/getEventById';
import styles from '@/styles/ingressos/Cupons.module.scss';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getServerSession } from 'next-auth';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import ModalCreatePromoCode from './ModalCreateCupom';
import ModalEditPromoCode from './ModalEditCupom';

export interface Coupon {
    couponCode: string;
    discount: string;
    isActive: boolean;
    type: 'percent' | 'fixed';
}

const Ingressos: NextPageWithLayout<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ event, coupons, usedCouponsByEventId }) => {
    const router = useRouter();
    const { eventId } = router.query;

    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const closePromoModal = () => setIsPromoModalOpen(false);
    const closeEditModal = () => setIsEditModalOpen(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCoupons, setFilteredCoupons] = useState(coupons);
    const [currentCoupon, setCurrentCoupon] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [lastDocSnapshot, setLastDocSnapshot] = useState<string | null>(null);

    const [pageCursors, setPageCursors] = useState<(string | null)[]>([null]);

    const links = useMemo(() => {
        return [
            {
                href: `/admin/ingressos/${eventId}`,
                label: 'Ingressos',
                active: false,
            },
            {
                href: `/admin/administrar-cupons/${eventId}`,
                label: 'Códigos promocionais',
                active: true,
            },
        ];
    }, [eventId]);

    const transformedEvent = {
        id: event.id,
        name: event.name,
        slug: event.slug,
        isVisible: event.isVisible,
        startDate: event.startDateTimestamp,
        endDate: event.endDateTimestamp,
        fullAddress: `${event.address.street}, ${event.address.number}`,
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const openPromoModal = () => {
        setIsPromoModalOpen(true);
    };

    useEffect(() => {
        if (searchQuery === '') {
            setFilteredCoupons(coupons);
        } else {
            const filtered = coupons.filter((coupon: any) =>
                coupon.couponCode
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            );
            setFilteredCoupons(filtered);
        }
    }, [searchQuery, coupons]);

    const addCoupon = (newCoupon: any) => {
        setFilteredCoupons((prevCoupons: any) => [...prevCoupons, newCoupon]);
    };

    const editCoupon = (editedCoupon: any) => {
        const couponIndex = filteredCoupons.findIndex(
            (coupon: any) => coupon.couponCode === editedCoupon.couponCode
        );

        if (couponIndex !== -1) {
            setFilteredCoupons((prevFilteredCoupons: any) => {
                const updatedCoupons = [...prevFilteredCoupons];
                updatedCoupons[couponIndex] = editedCoupon;
                return updatedCoupons;
            });
        }
    };

    const handleDeleteCoupon = async (couponCode: string) => {
        if (!confirm('Tem certeza que deseja excluir este cupom?')) {
            return;
        }

        try {
            const res = await fetch(
                `/api/events/${eventId}/coupons/${couponCode}/delete`,
                {
                    method: 'DELETE',
                }
            );

            if (!res.ok) {
                toast.error('Falha ao excluir o cupom!', {
                    icon: '🚨',
                });
                return;
            }

            toast.success('Cupom deletado com sucesso!', {
                icon: '🎉',
            });

            setFilteredCoupons(
                filteredCoupons.filter(
                    (coupon: any) => coupon.couponCode !== couponCode
                )
            );
        } catch (error) {
            console.error('Erro ao excluir o cupom', error);
        }
    };

    const usedCouponsMap = new Map(
        usedCouponsByEventId.map((uc) => [uc.name, uc.usedCount])
    );

    const handleCopyLink = async (couponCode: string) => {
        const formattedCouponCode = couponCode.toUpperCase();
        const link = `https://www.1001ingressos.com.br/evento/${event.slug}?c=${formattedCouponCode}`;
        try {
            await navigator.clipboard.writeText(link);
            toast.success('Link copiado para a área de transferência!', {
                icon: '🔗',
            });
        } catch (error) {
            toast.error('Erro ao copiar o link!', {
                icon: '❌',
            });
        }
    };

    const openEditModal = (coupon: any) => {
        setIsEditModalOpen(true);
        setCurrentCoupon(coupon);
    };

    useEffect(() => {
        const fetchSearchedCoupons = async (query: string) => {
            try {
                const response = await fetch(
                    `/api/events/${eventId}/coupons/search?query=${query.toLocaleLowerCase()}`
                );

                const data = await response.json();
                if (data.coupons) {
                    setFilteredCoupons(data.coupons);
                }
            } catch (error) {
                console.error('Erro ao buscar cupons', error);
            }
        };
        if (searchQuery === '') {
            return;
        }

        fetchSearchedCoupons(searchQuery);
    }, [eventId, searchQuery]);

    useEffect(() => {
        const fetchCoupons = async () => {
            let url = `/api/events/${eventId}/coupons/page/${currentPage}/${lastDocSnapshot}`;
            const response = await fetch(url);
            const data = await response.json();
            const newCoupons = data.coupons;
            setFilteredCoupons(newCoupons);

            if (newCoupons.length > 0) {
                setLastDocSnapshot(
                    newCoupons[newCoupons.length - 1].couponCode
                );
            }
        };

        fetchCoupons();
    }, [currentPage, eventId]);

    const handleNextPage = () => {
        const newPageCursors = [...pageCursors];
        newPageCursors[currentPage] = lastDocSnapshot;
        setPageCursors(newPageCursors);
        console.log(pageCursors);
        setCurrentPage(currentPage + 1);
    };

    const handlePreviousPage = () => {
        console.log(pageCursors[currentPage - 2]);
        setLastDocSnapshot(pageCursors[currentPage - 2]);
        setCurrentPage(currentPage - 1);
    };

    useEffect(() => {
        if (filteredCoupons.length > 0) {
            setLastDocSnapshot(
                filteredCoupons[filteredCoupons.length - 1].couponCode
            );
        }
    }, [filteredCoupons]);

    return (
        <>
            <ModalCreatePromoCode
                isOpen={isPromoModalOpen}
                onClose={closePromoModal}
                eventId={eventId}
                onAddCoupon={addCoupon}
            />
            <ModalEditPromoCode
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                currentCoupon={currentCoupon}
                eventId={eventId}
                oneEditCoupon={editCoupon}
            />

            <main className={styles.container}>
                <AdminEventLayout event={transformedEvent} links={links}>
                    {coupons.length > 0 ? (
                        <AdminCard title="Participantes do evento">
                            <div className={styles.contentCard__actions}>
                                <div className={styles.searchBar}>
                                    <img src="/search.svg" alt="" />
                                    <input
                                        type="search"
                                        placeholder="Pesquise o código exato do Cupom"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />

                                    <img
                                        src="/closeSearch.svg"
                                        alt=""
                                        onClick={handleClearSearch}
                                    />
                                </div>
                                <button
                                    className={styles.criarCupom}
                                    onClick={openPromoModal}
                                >
                                    criar código
                                </button>
                            </div>

                            <section className={styles.tableContainer}>
                                <header className={styles.tableHeader}>
                                    <p>
                                        <b>CÓDIGO</b>
                                    </p>
                                    <p>
                                        <b>DESCONTO</b>
                                    </p>
                                    <p>
                                        <b>UTILIZADOS</b>
                                    </p>
                                    <p>
                                        <b>Ações</b>
                                    </p>
                                </header>
                                {filteredCoupons.length > 0 ? (
                                    filteredCoupons.map(
                                        (coupon: Coupon, index: number) => {
                                            const usedCount =
                                                usedCouponsMap.get(
                                                    coupon.couponCode
                                                ) || 0;

                                            return (
                                                <section
                                                    className={styles.tableRow}
                                                    key={index}
                                                >
                                                    <p>{coupon.couponCode}</p>
                                                    <p>
                                                        {coupon.type ===
                                                        'percent'
                                                            ? `${coupon.discount}%`
                                                            : `R$${coupon.discount}`}
                                                    </p>
                                                    <p>{usedCount}</p>
                                                    <div
                                                        className={
                                                            styles.rowIcons
                                                        }
                                                    >
                                                        <img
                                                            src="/linkPurple.svg"
                                                            alt="Link"
                                                            onClick={() =>
                                                                handleCopyLink(
                                                                    coupon.couponCode
                                                                )
                                                            }
                                                            style={{
                                                                cursor: 'pointer',
                                                            }}
                                                        />
                                                        <img
                                                            src="/pencil.svg"
                                                            alt="Editar"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    coupon
                                                                )
                                                            }
                                                        />
                                                        <img
                                                            src="/trash.svg"
                                                            alt="Excluir"
                                                            onClick={() =>
                                                                handleDeleteCoupon(
                                                                    coupon.couponCode
                                                                )
                                                            }
                                                            style={{
                                                                cursor: 'pointer',
                                                            }}
                                                        />
                                                    </div>
                                                </section>
                                            );
                                        }
                                    )
                                ) : (
                                    <section className={styles.tableRow}>
                                        <p className={styles.tableFullWidth}>
                                            Nenhum cupom encontrado.
                                        </p>
                                    </section>
                                )}
                            </section>
                            <div className={styles.pagination}>
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className={styles.buttonArrow}
                                >
                                    <img src="/leftArrowPagination.svg" />
                                </button>
                                <p>{currentPage}</p>
                                <button
                                    onClick={handleNextPage}
                                    disabled={filteredCoupons.length < 10}
                                    className={styles.buttonArrow}
                                >
                                    <img src="/rightArrowPagination.svg" />
                                </button>
                            </div>
                        </AdminCard>
                    ) : (
                        <NotFoundContainer onOpenModal={openPromoModal} />
                    )}
                </AdminEventLayout>
            </main>
        </>
    );
};

Ingressos.getLayout = function getLayout(page: ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default Ingressos;

export const getServerSideProps = (async (context) => {
    const { eventId } = context.params as { eventId: string };

    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    );

    if (!session || !session.user.roleId) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }

    const adminRoles = ['X0v3WRX84lSVCK6wsRM5', 'Fuz4gzZy95ZVoj8dJgIo'];
    const isAdmin = adminRoles.includes(session.user.roleId);

    if (!isAdmin) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }

    const event = await getEventById(eventId);

    const { coupons } = await getAllCouponsByEventId(eventId, null);

    const usedCouponsByEventId = await getUsedCouponsByEventId(eventId);

    return {
        props: {
            event: event.eventData,
            coupons,
            usedCouponsByEventId,
        },
    };
}) satisfies GetServerSideProps;
