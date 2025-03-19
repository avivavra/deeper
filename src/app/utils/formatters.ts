export const format = {
    numberToFixed: (num?: number, digits = 2) => num ? parseFloat(num.toFixed(digits)).toString() : num,
};