export const format = {
    numberToFixed: (num?: number, digits = 2) => {
        if (num === undefined) return num;
        const fixed = parseFloat(num.toFixed(digits));
        return new Intl.NumberFormat().format(fixed);
    },
};