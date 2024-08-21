export interface BatchDTO {
    name: string;
    gender: 'FEMININO' | 'MASCULINO' | 'UNISSEX';
    type: 'PUBLIC' | 'PRIVATE' | 'SECRET';
    price: number;
    availableAmount: number;
    startAmount: number;
    isVisible: boolean;
    startDate: Date;
    endDate: Date;
    minBuyAmount: number;
    maxBuyAmount: number;
    description: string | null;
    parentBatch: string | null;
}
