export function round(value: number, decimals = 2) {
    return (
        Math.round((value + Number.EPSILON) * 10 ** decimals) / 10 ** decimals
    );
}
