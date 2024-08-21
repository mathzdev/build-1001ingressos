import { DetailedHTMLProps, InputHTMLAttributes, forwardRef } from 'react';
import { IMaskInput, IMaskInputProps } from 'react-imask';
import styles from './styles.module.scss';

interface BaseInputProps
    extends DetailedHTMLProps<
        InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
    > {
    label?: string;
    value?: string;
    containerClassName?: string;
}

type MaskedInputProps = BaseInputProps & IMaskInputProps<HTMLInputElement>;

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
    (
        {
            type = 'string',
            label,
            placeholder,
            value,
            required = false,
            onAccept,
            className,
            containerClassName,
            name,
            unmask = true,
            ...props
        },
        ref
    ) => {
        return (
            <div
                className={`${styles.inputContainer} ${
                    containerClassName ?? ''
                }`}
            >
                {label && (
                    <label
                        className={styles.inputLabel}
                        data-required={required}
                        htmlFor={name}
                    >
                        {label}
                    </label>
                )}
                <IMaskInput
                    name={name}
                    type={type}
                    className={`${styles.inputElement} ${className}`}
                    placeholder={placeholder}
                    value={value}
                    required={required}
                    onAccept={onAccept}
                    ref={ref as any}
                    unmask={unmask}
                    {...props}
                />
            </div>
        );
    }
);

MaskedInput.displayName = 'MaskedInput';

export default MaskedInput;
