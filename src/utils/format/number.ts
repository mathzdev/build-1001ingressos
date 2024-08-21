export const formatPercentage = (num: number) => {
    return num.toLocaleString('pt-BR', {
        style: 'percent',
    });
};

export const formatCurrency = (num: number) => {
    return num.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};
