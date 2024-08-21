import { DetailedHTMLProps, InputHTMLAttributes, forwardRef } from 'react';
import styles from './styles.module.scss';

interface BaseInputProps
    extends DetailedHTMLProps<
        InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
    > {
    label?: string;
    value?: string;
    containerClassName?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type InputProps = BaseInputProps;

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            type = 'string',
            label,
            placeholder,
            value,
            required = false,
            onChange,
            className,
            containerClassName,
            name,
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

                <input
                    name={name}
                    type={type}
                    className={`${styles.inputElement} ${className}`}
                    placeholder={placeholder}
                    value={value}
                    required={required}
                    onChange={onChange}
                    ref={ref}
                    {...props}
                />
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
