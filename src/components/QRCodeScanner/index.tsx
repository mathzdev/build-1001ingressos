import QrScanner from 'qr-scanner';
import { useEffect, useRef, useState } from 'react';

export type QRCodeScannerOptions = {
    onDecodeError?: (error: Error | string) => void;
    calculateScanRegion?: (video: HTMLVideoElement) => QrScanner.ScanRegion;
    preferredCamera?: QrScanner.FacingMode | QrScanner.DeviceId;
    maxScansPerSecond?: number;
    highlightScanRegion?: boolean;
    highlightCodeOutline?: boolean;
    overlay?: HTMLDivElement;
};

interface QRCodeScannerProps {
    onScan: (result: QrScanner.ScanResult) => void;
    onScanError?: (error: Error | string) => void;
    options: QRCodeScannerOptions;
    pauseScanner?: boolean;
    selectedCamera?: QrScanner.FacingMode | QrScanner.DeviceId;
    className?: string;
}

const QRCodeScanner = ({
    onScan,
    onScanError = () => {},
    options = {},
    pauseScanner = false,
    selectedCamera = 'environment',
    ...props
}: QRCodeScannerProps) => {
    const scanner = useRef<QrScanner>();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanResult, setScanResult] = useState<QrScanner.ScanResult>();

    useEffect(() => {
        if (scanResult) {
            onScan(scanResult);
        }
    }, [onScan, scanResult]);

    useEffect(() => {
        if (pauseScanner || !scanResult) return;

        const timer = setTimeout(() => {
            setScanResult(undefined);
        }, 5000);
        return () => clearTimeout(timer);
    }, [scanResult, pauseScanner]);

    useEffect(() => {
        if (!scanner.current) return;
        scanner.current.setCamera(selectedCamera);
    }, [selectedCamera]);

    useEffect(() => {
        if (videoRef.current && !scanner.current) {
            scanner.current = new QrScanner(
                videoRef.current,
                (result) => {
                    setScanResult((prev) => {
                        if (prev?.data === result.data) {
                            return prev;
                        }
                        return result;
                    });
                },
                {
                    returnDetailedScanResult: true,
                    ...options,
                    onDecodeError(error) {},
                }
            );
            scanner.current.start();
        }

        // Clean up on unmount
        return () => {
            if (!scanner.current) return;
            scanner.current.destroy();
            scanner.current = undefined;
        };
    }, [scanner, options]);

    return (
        <div {...props}>
            <video ref={videoRef}></video>
        </div>
    );
};

export default QRCodeScanner;
