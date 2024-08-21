import { ButtonHTMLAttributes, ReactElement } from 'react';

import styles from './styles.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    icon?: ReactElement;
    variant?: 'primary' | 'secondary' | 'admin' | 'admin-secondary' | 'glass';
    size?: 'x-small' | 'small' | 'medium' | 'large';
    isLoading?: boolean;
    hideLoading?: boolean;
}

const Button = ({
    label,
    icon,
    variant = 'primary',
    size = 'medium',
    isLoading = false,
    hideLoading = false,
    className,
    ...props
}: ButtonProps) => {
    return (
        <button
            className={`${styles.button} ${className}`}
            data-has-icon={!!icon}
            data-label={label}
            data-variant={variant}
            data-size={size}
            data-loading={isLoading}
            data-hide-loading={hideLoading}
            {...props}
        >
            <>
                {icon}
                {label}
            </>
        </button>
    );
};

export default Button;
