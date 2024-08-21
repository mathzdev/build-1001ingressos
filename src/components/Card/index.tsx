import {
    CSSProperties,
    RefObject,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { getCardType } from '@/utils/card';
import styles from './styles.module.scss';

// const CARDS = {
//     visa: '^4',
//     amex: '^(34|37)',
//     mastercard: '^5[1-5]',
//     discover: '^6011',
//     unionpay: '^62',
//     troy: '^9792',
//     diners: '^(30[0-5]|36)',
// };

const cardBackgroundName = () => {
    let random = Math.floor(Math.random() * 25 + 1);
    return `${random}.jpeg`;
};

export type CardInputTypes = 'cardNumber' | 'cardHolder' | 'cardDate';

interface CardProps {
    cardHolder: string;
    cardNumber: string;
    cardMonth: string;
    cardYear: string;
    cardCvv: string;
    isCardFlipped: boolean;
    currentFocusedElm: CardInputTypes | null;
    onCardElementClick: (type: CardInputTypes) => void;
}

const Card = ({
    cardHolder,
    cardNumber,
    cardMonth,
    cardYear,
    cardCvv,
    isCardFlipped,
    currentFocusedElm,
    onCardElementClick,
}: CardProps) => {
    const [style, setStyle] = useState<CSSProperties>({});

    const cardNumberRef = useRef<HTMLLabelElement>(null);
    const cardHolderRef = useRef<HTMLLabelElement>(null);
    const cardDateRef = useRef<HTMLDivElement>(null);

    const BACKGROUND_IMG = useMemo(cardBackgroundName, []);
    const card = useMemo(() => getCardType(cardNumber), [cardNumber]);

    const outlineElementStyle = (element: HTMLElement) => {
        return element
            ? {
                  width: `${element.offsetWidth}px`,
                  height: `${element.offsetHeight}px`,
                  transform: `translateX(${element.offsetLeft}px) translateY(${element.offsetTop}px)`,
              }
            : null;
    };

    useEffect(() => {
        const refs: { [key in CardInputTypes]: RefObject<HTMLElement | null> } =
            {
                cardNumber: cardNumberRef,
                cardHolder: cardHolderRef,
                cardDate: cardDateRef,
            };
        if (currentFocusedElm && refs[currentFocusedElm].current !== null) {
            const style = outlineElementStyle(refs[currentFocusedElm].current!);
            setStyle(style ?? {});
        }
    }, [currentFocusedElm]);

    const maskCardNumber = (cardNumber: string) => {
        let cardNumberArr = cardNumber.split('');
        cardNumberArr.forEach((val, index) => {
            if (index > 4 && index < card.hideUntil) {
                if (cardNumberArr[index] !== ' ') {
                    cardNumberArr[index] = '*';
                }
            }
        });

        return cardNumberArr;
    };

    return (
        <section
            className={`${styles['card-item']} ${
                isCardFlipped ? styles['-active'] : ''
            }`}
        >
            <div className={`${styles['card-item__side']} ${styles['-front']}`}>
                <div
                    className={`${styles['card-item__focus']} ${
                        currentFocusedElm ? styles['-active'] : ``
                    }`}
                    style={style}
                />
                <div className={styles['card-item__cover']}>
                    <img
                        alt=""
                        src={`/card-background/${BACKGROUND_IMG}`}
                        className={styles['card-item__bg']}
                    />
                </div>

                <div className={styles['card-item__wrapper']}>
                    <div className={styles['card-item__top']}>
                        <img
                            src={'/chip.png'}
                            alt=""
                            className={styles['card-item__chip']}
                        />
                        <div className={styles['card-item__type']}>
                            <img
                                alt={card.name}
                                src={`/card-type/${card.key}.png`}
                                className={styles['card-item__typeImg']}
                            />
                        </div>
                    </div>

                    <label
                        className={styles['card-item__number']}
                        onClick={() => onCardElementClick('cardNumber')}
                        ref={cardNumberRef}
                    >
                        {cardNumber ? (
                            maskCardNumber(cardNumber).map((val, index) => (
                                <div
                                    key={index}
                                    className={styles['card-item__numberItem']}
                                >
                                    {val}
                                </div>
                            ))
                        ) : (
                            <div className={styles['card-item__numberItem']}>
                                #
                            </div>
                        )}
                    </label>
                    <div className={styles['card-item__content']}>
                        <label
                            className={styles['card-item__info']}
                            onClick={() => onCardElementClick('cardHolder')}
                            ref={cardHolderRef}
                        >
                            <div className={styles['card-item__holder']}>
                                Card Holder
                            </div>
                            <div className={styles['card-item__name']}>
                                {cardHolder === 'FULL NAME' ||
                                cardHolder.length === 0 ? (
                                    <div>FULL NAME</div>
                                ) : (
                                    cardHolder.split('').map((val, index) => (
                                        <span
                                            key={index}
                                            className={
                                                styles['card-item__nameItem']
                                            }
                                        >
                                            {val}
                                        </span>
                                    ))
                                )}
                            </div>
                        </label>
                        <div
                            className={styles['card-item__date']}
                            onClick={() => onCardElementClick('cardDate')}
                            ref={cardDateRef}
                        >
                            <label className={styles['card-item__dateTitle']}>
                                Expires
                            </label>
                            <label className={styles['card-item__dateItem']}>
                                <span key={cardMonth}>
                                    {!cardMonth ? 'MM' : cardMonth}{' '}
                                </span>
                            </label>
                            /
                            <label
                                htmlFor="cardYear"
                                className={styles['card-item__dateItem']}
                            >
                                <span key={cardYear}>
                                    {!cardYear
                                        ? 'YY'
                                        : cardYear.toString().substr(-2)}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${styles['card-item__side']} ${styles['-back']}`}>
                <div className={styles['card-item__cover']}>
                    <img
                        alt=""
                        src={`/card-background/${BACKGROUND_IMG}`}
                        className={styles['card-item__bg']}
                    />
                </div>
                <div className={styles['card-item__band']} />
                <div className={styles['card-item__cvv']}>
                    <div className={styles['card-item__cvvTitle']}>CVV</div>
                    <div className={styles['card-item__cvvBand']}>
                        {cardCvv.split('').map((val, index) => (
                            <span key={index}>*</span>
                        ))}
                    </div>
                    <div className={styles['card-item__type']}>
                        <img
                            alt="card-type"
                            src={'/card-type/visa.png'}
                            className={styles['card-item__typeImg']}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Card;
