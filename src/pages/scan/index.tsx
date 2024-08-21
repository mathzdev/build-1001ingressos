import styles from '@/styles/Scan.module.scss';

import { useRouter } from 'next/router';
import {
    FormEvent,
    MouseEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import Button from '@/components/Button';
import Input from '@/components/Inputs/Input';
import QRCodeScanner, {
    QRCodeScannerOptions,
} from '@/components/QRCodeScanner';
import ArrowIcon from '@/icons/ArrowIcon';
import CameraFlipIcon from '@/icons/CameraFlipIcon';
import { formatDateTime } from '@/utils/format/date';
import axios, { isAxiosError } from 'axios';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import QrScanner from 'qr-scanner';
import { useSwipeable } from 'react-swipeable';
import { toast } from 'react-toastify';
import { authOptions } from '../api/auth/[...nextauth]';
import { ValidationResponse } from '../api/tickets/validate';

const swipeConfig = {
    delta: 10, // min distance(px) before a swipe starts
    preventDefaultTouchmoveEvent: false, // call e.preventDefault *See Details*
    trackTouch: true, // track touch input
    trackMouse: true, // track mouse input
    rotationAngle: 0, // set a rotation angle
};

export const getServerSideProps = (async (context) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    );

    const allowedRoles = ['X0v3WRX84lSVCK6wsRM5', 'xVN8VdZ5MpRnvGJRFOZ3'];

    if (!session || !allowedRoles.includes(session.user.roleId ?? '')) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }

    return {
        props: {},
    };
}) satisfies GetServerSideProps;

const Scan = () => {
    const router = useRouter();
    const { eventId } = router.query;

    const [selectedCamera, setSelectedCamera] =
        useState<QrScanner.FacingMode>('environment');
    const [scanResult, setScanResult] = useState<QrScanner.ScanResult>();
    const [isValidationLoading, setIsValidationLoading] = useState(false);

    const [openScanResult, setOpenScanResult] = useState(false);
    const [swipeDelta, setSwipeDelta] = useState(0);

    const [scannedTicket, setScannedTicket] = useState<ValidationResponse>();

    const handlers = useSwipeable({
        onSwiping(eventData) {
            if (!!scannedTicket) {
                setSwipeDelta(eventData.deltaY * -1);
            }
        },
        onSwipedUp(eventData) {
            setOpenScanResult(!!scannedTicket);
        },
        onSwipedDown(eventData) {
            setOpenScanResult(false);
        },
        ...swipeConfig,
    });

    useEffect(() => {
        if (swipeDelta <= -75) {
            setOpenScanResult(false);
        } else if (swipeDelta >= 75) {
            setOpenScanResult(!!scannedTicket);
        }
    }, [swipeDelta, scannedTicket]);

    useEffect(() => {
        if (scannedTicket) {
            setOpenScanResult(true);
            const timer = setTimeout(() => {
                // setScannedTicket(undefined);
                setOpenScanResult(false);
            }, 5000);
            return () => {
                clearTimeout(timer);
            };
        } else {
            setOpenScanResult(false);
        }
    }, [scannedTicket]);

    const scannerOptions = useMemo<QRCodeScannerOptions>(
        () => ({
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 2,
            calculateScanRegion(video) {
                const width = video.videoWidth;
                const height = video.videoHeight;
                const size = Math.min(width, height) * 0.6;
                const x = (width - size) / 2;
                const y = (height - size) / 2;

                return {
                    x,
                    y,
                    width: size,
                    height: size,
                };
            },
        }),
        []
    );

    const handleFlipCamera = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        setSelectedCamera((prev) =>
            prev === 'environment' ? 'user' : 'environment'
        );
    }, []);

    const validateTicket = useCallback((ticketId: string) => {
        toast.promise(
            async () => {
                setIsValidationLoading(true);
                const { data } = await axios.post<ValidationResponse>(
                    '/api/tickets/validate',
                    {
                        ticketId,
                    }
                );
                return data;
            },
            {
                pending: 'Verificando ticket...',
                success: {
                    render({ data }) {
                        setIsValidationLoading(false);
                        setScannedTicket(data);
                        return 'Ticket validado com sucesso!';
                    },
                },
                error: {
                    render({ data: error }) {
                        let message = 'Não foi possível validar o ticket.';
                        setIsValidationLoading(false);

                        if (
                            isAxiosError<{
                                error: string;
                                message: string;
                                data?: {
                                    name: string;
                                    ticket: ValidationResponse;
                                };
                            }>(error)
                        ) {
                            const responseData = error.response?.data;
                            switch (error.response?.data.error) {
                                case 'unauthorized':
                                case 'forbidden':
                                    message =
                                        'Você não tem permissão para validar este ticket.';
                                    break;
                                case 'not_found':
                                    message = 'Ticket não encontrado.';
                                    break;
                                case 'ticket_already_scanned':
                                    message = responseData?.data?.name
                                        ? `Ticket já validado por ${responseData?.data?.name}.`
                                        : `Ticket já validado.`;
                                    if (responseData && responseData.data) {
                                        setScannedTicket(
                                            responseData.data.ticket
                                        );
                                    }
                                    break;
                                case 'not_paid':
                                    message = 'Ticket não foi pago.';
                                    break;
                                default:
                                    break;
                            }
                        }
                        return message;
                    },
                },
            }
        );
    }, []);

    const handleScan = useCallback(
        async (result: QrScanner.ScanResult) => {
            if (result.data.startsWith('ticketking://ticket.validate/')) {
                const ticketId = result.data.split('/').pop();
                if (!ticketId) {
                    return;
                }
                validateTicket(ticketId);
            }
            setScanResult(result);
        },
        [validateTicket]
    );

    const handleSearchSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            const { ticketId } = Object.fromEntries(formData.entries());

            if (!ticketId) {
                return;
            }

            validateTicket(ticketId.toString());
        },
        [validateTicket]
    );

    return (
        <main className={styles.container}>
            <header>
                <Link href="/" onClick={router.back}>
                    <ArrowIcon />
                </Link>
                <h1>Check-in QRCode</h1>
                <button onClick={handleFlipCamera}>
                    <CameraFlipIcon />
                </button>
            </header>
            <QRCodeScanner
                onScan={handleScan}
                options={scannerOptions}
                pauseScanner={isValidationLoading}
                selectedCamera={selectedCamera}
                className={styles.scannerContainer}
            />
            <section
                className={styles.scanResult}
                data-open={openScanResult}
                style={{
                    // @ts-ignore
                    '--swipe-delta': `${swipeDelta}px`,
                }}
                {...handlers}
            >
                <form
                    className={styles.searchContainer}
                    onSubmit={handleSearchSubmit}
                >
                    <Input type="search" name="ticketId" />
                    <Button label="Validar" size="x-small" type="submit" />
                </form>
                {scannedTicket && (
                    <>
                        <section>
                            <div>
                                <span>Nome</span>
                                <p>{scannedTicket.user.name}</p>
                            </div>
                        </section>
                        <section>
                            <div>
                                <span>Ingresso</span>
                                <p>{scannedTicket.batch.name}</p>
                            </div>
                        </section>
                        <section>
                            <div>
                                <span>Validado por</span>
                                <p>
                                    {scannedTicket.scannedBy?.name} -{' '}
                                    {formatDateTime(
                                        new Date(scannedTicket.dateScanned)
                                    )}
                                </p>
                            </div>
                        </section>
                    </>
                )}
            </section>
        </main>
    );
};

export default Scan;
