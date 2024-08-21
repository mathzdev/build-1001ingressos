export const SUPPORTED_CARDS = {
    visa: {
        name: 'Visa',
        pattern: '^4',
        format(value: string) {
            return value
                .replace(/(\d{4})/, '$1 ')
                .replace(/(\d{4}) (\d{4})/, '$1 $2 ')
                .replace(/(\d{4}) (\d{4}) (\d{4})/, '$1 $2 $3 ');
        },
        length: 16,
        hideUntil: 14,
        maxLength: 19,
    },
    amex: {
        name: 'American Express',
        pattern: '^(34|37)',
        format(value: string) {
            return value
                .replace(/(\d{4})/, '$1 ')
                .replace(/(\d{4}) (\d{6})/, '$1 $2 ');
        },
        length: 15,
        hideUntil: 12,
        maxLength: 17,
    },
    mastercard: {
        name: 'Mastercard',
        pattern: '^5[1-5]',
        format(value: string) {
            return value
                .replace(/(\d{4})/, '$1 ')
                .replace(/(\d{4}) (\d{4})/, '$1 $2 ')
                .replace(/(\d{4}) (\d{4}) (\d{4})/, '$1 $2 $3 ');
        },
        length: 16,
        hideUntil: 14,
        maxLength: 19,
    },
    discover: {
        name: 'Discover',
        pattern: '^6011',
        format(value: string) {
            return value
                .replace(/(\d{4})/, '$1 ')
                .replace(/(\d{4}) (\d{4})/, '$1 $2 ')
                .replace(/(\d{4}) (\d{4}) (\d{4})/, '$1 $2 $3 ');
        },
        length: 16,
        hideUntil: 14,
        maxLength: 19,
    },
    unionpay: {
        name: 'Unionpay',
        pattern: '^62',
        format(value: string) {
            return value
                .replace(/(\d{4})/, '$1 ')
                .replace(/(\d{4}) (\d{4})/, '$1 $2 ')
                .replace(/(\d{4}) (\d{4}) (\d{4})/, '$1 $2 $3 ');
        },
        length: 16,
        hideUntil: 14,
        maxLength: 19,
    },
    troy: {
        name: 'Troy',
        pattern: '^9792',
        format(value: string) {
            return value
                .replace(/(\d{4})/, '$1 ')
                .replace(/(\d{4}) (\d{4})/, '$1 $2 ')
                .replace(/(\d{4}) (\d{4}) (\d{4})/, '$1 $2 $3 ');
        },
        length: 16,
        hideUntil: 14,
        maxLength: 19,
    },
    diners: {
        name: 'Diners Club',
        pattern: '^(30[0-5]|36)',
        format(value: string) {
            return value
                .replace(/(\d{4})/, '$1 ')
                .replace(/(\d{4}) (\d{6})/, '$1 $2 ');
        },
        length: 14,
        hideUntil: 12,
        maxLength: 16,
    },
};

export function getCardType(cardNumber: string) {
    const number = cardNumber;
    let cardRegex;
    for (const [card, info] of Object.entries(SUPPORTED_CARDS)) {
        cardRegex = new RegExp(info.pattern);
        if (number.match(cardRegex) != null) {
            return {
                key: card,
                ...SUPPORTED_CARDS[card as keyof typeof SUPPORTED_CARDS],
            };
        }
    }

    return {
        name: 'Default',
        key: 'default',
        pattern: '',
        format(value: string) {
            return value
                .replace(/(\d{4})/, '$1 ')
                .replace(/(\d{4}) (\d{4})/, '$1 $2 ')
                .replace(/(\d{4}) (\d{4}) (\d{4})/, '$1 $2 $3 ');
        },
        length: 16,
        hideUntil: 14,
        maxLength: 19,
    };
}
