import { DetailedHTMLProps, InputHTMLAttributes, forwardRef } from 'react';
import styles from './styles.module.scss';

const currentYear = new Date().getFullYear();
const monthsArr = Array.from({ length: 12 }, (x, i) => {
    const month = i + 1;
    return month <= 9 ? '0' + month : month;
});
const yearsArr = Array.from({ length: 15 }, (_x, i) => currentYear + i);

interface InputProps
    extends DetailedHTMLProps<
        InputHTMLAttributes<HTMLSelectElement>,
        HTMLSelectElement
    > {
    label: string;
    monthValue: string;
    onCardMonthChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onCardMonthInputFocus: (e: React.FocusEvent<HTMLSelectElement>) => void;
    yearValue: string;
    onCardYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onCardYearInputFocus: (e: React.FocusEvent<HTMLSelectElement>) => void;
    onInputBlur: (e: React.FocusEvent<HTMLSelectElement>) => void;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const DateSelect = forwardRef<HTMLSelectElement, InputProps>(
    (
        {
            type = 'string',
            label,
            placeholder,
            required = false,
            onChange,
            monthValue,
            onCardMonthChange,
            onCardMonthInputFocus,
            yearValue,
            onCardYearChange,
            onCardYearInputFocus,
            onInputBlur,
            className,
            name,
            ...props
        },
        ref
    ) => {
        return (
            <div className={styles.selectContainer}>
                <label
                    className={styles.inputLabel}
                    data-required={required}
                    htmlFor="cardMonth"
                >
                    {label}
                </label>
                <div className={styles.selectWrapper}>
                    <select
                        className={`${styles.selectElement} ${className}`}
                        value={monthValue}
                        name="cardMonth"
                        onChange={onCardMonthChange}
                        ref={ref}
                        onFocus={onCardMonthInputFocus}
                        onBlur={onInputBlur}
                        required
                    >
                        <option value="" disabled>
                            Mês
                        </option>

                        {monthsArr
                            .filter((val) => {
                                const now = new Date();
                                const currentYear = now.getFullYear();
                                if (Number(yearValue) === currentYear) {
                                    return Number(val) >= now.getMonth() + 1;
                                }
                                return true;
                            })
                            .map((val, index) => (
                                <option key={index} value={val}>
                                    {val}
                                </option>
                            ))}
                    </select>
                    <select
                        name="cardYear"
                        className={`${styles.selectElement} ${className}`}
                        value={yearValue}
                        onChange={onCardYearChange}
                        onFocus={onCardYearInputFocus}
                        onBlur={onInputBlur}
                        required
                    >
                        <option value="" disabled>
                            Ano
                        </option>

                        {yearsArr.map((val, index) => (
                            <option key={index} value={val}>
                                {val}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        );
    }
);

DateSelect.displayName = 'DateSelect';

export default DateSelect;
