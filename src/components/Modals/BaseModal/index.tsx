import Button from '@/components/Button';
import Logo1001Ingressos from '@/icons/Logo1001Ingressos';
import { ReactNode, useEffect, useRef, useState } from 'react';
import useDialog from '../useDialog';
import styles from './styles.module.scss';

interface ModalProps {
    id: string;
    title: string;
    subTitle?: string;
    submitLabel?: string;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    submitIsLoading?: boolean;
    disableClosing?: boolean;
    children?: ReactNode;
}

export default function BaseModal({
    id,
    title,
    subTitle,
    submitLabel = 'Enviar',
    onSubmit,
    submitIsLoading = false,
    disableClosing = false,
    children,
}: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const dialogWrapperRef = useRef<HTMLDivElement>(null);
    useDialog(dialogWrapperRef, dialogRef, disableClosing);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        dialogRef.current?.addEventListener('opening', () => {
            setIsOpen(true);
        });
        dialogRef.current?.addEventListener('closing', () => {
            setIsOpen(false);
        });

        return () => {
            dialogRef.current?.removeEventListener('opening', () => {
                setIsOpen(true);
            });
            dialogRef.current?.removeEventListener('closing', () => {
                setIsOpen(false);
            });
        };
    }, []);

    return (
        <div
            className={styles.dialogWrapper}
            data-open={isOpen}
            data-name="DIALOG_WRAPPER"
            ref={dialogWrapperRef}
        >
            <dialog
                className={styles.dialog}
                id={id}
                modal-mode="mega"
                ref={dialogRef}
            >
                <form method="dialog" onSubmit={onSubmit}>
                    <header>
                        <Logo1001Ingressos />
                        <button
                            type="button"
                            disabled={disableClosing}
                            onClick={(e) => {
                                e.preventDefault();
                                if (!disableClosing) {
                                    // @ts-ignore
                                    window[id].close('close');
                                }
                            }}
                        >
                            &#x2715;
                        </button>
                    </header>
                    <article>
                        <header>
                            <h3>{title}</h3>
                            <p>{subTitle}</p>
                        </header>
                        {children}
                    </article>
                    <footer>
                        <menu>
                            <Button
                                label={submitLabel}
                                isLoading={submitIsLoading}
                                type="submit"
                            />
                        </menu>
                    </footer>
                </form>
            </dialog>
        </div>
    );
}
