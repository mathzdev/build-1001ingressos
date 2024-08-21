import AddIcon from '@/icons/AddIcon';
import MinusIcon from '@/icons/MinusIcon';
import { HTMLAttributes, MouseEvent, useState } from 'react';
import styles from './styles.module.scss';

interface BatchCardProps extends HTMLAttributes<HTMLDivElement> {
    batch: {
        id: string;
        name: string;
        description: string;
        price: number;
        minBuyAmount: number;
        maxBuyAmount: number;
        availableAmount: number;
        type: 'feminino' | 'masculino' | 'unissex';
    };
    coupon: {
        couponCode: string;
        discount: number;
        type: 'fixed' | 'percent';
    } | null;
    onSelectTicket?: (id: string, quantity: number) => void;
}

const BatchCard = ({ batch, coupon, onSelectTicket }: BatchCardProps) => {
    const [quantity, setQuantity] = useState(0);

    const handleIncrement = (e: MouseEvent<HTMLOrSVGElement>) => {
        e.preventDefault();

        if (quantity < batch.maxBuyAmount) {
            setQuantity((prevQuantity: number) => {
                onSelectTicket?.(batch.id, prevQuantity + 1);
                return prevQuantity + 1;
            });
        }
    };

    const handleDecrement = (e: MouseEvent<HTMLOrSVGElement>) => {
        e.preventDefault();

        if (quantity > 0) {
            setQuantity((prevQuantity: number) => {
                onSelectTicket?.(batch.id, prevQuantity - 1);
                return prevQuantity - 1;
            });
        }
    };

    const discountedPrice = coupon
        ? coupon.type === 'fixed'
            ? batch.price - coupon.discount
            : batch.price * (1 - coupon.discount / 100)
        : null;

    return (
        <div className={styles.rowTicket}>
            <div className={styles.rowLeftSide}>
                <p>{batch.name}</p>
                {discountedPrice ? (
                    <p>
                        <span>R${batch.price}</span>{' '}
                        <b>
                            R$
                            {(discountedPrice > 0
                                ? discountedPrice
                                : 0
                            ).toFixed(2)}
                        </b>
                    </p>
                ) : (
                    <p>R${batch.price}</p>
                )}
            </div>
            <div className={styles.rowFemininoRightSide}>
                <MinusIcon onClick={handleDecrement} />
                <p>{quantity}</p>
                <AddIcon onClick={handleIncrement} />
            </div>
        </div>
    );
};

export default BatchCard;
