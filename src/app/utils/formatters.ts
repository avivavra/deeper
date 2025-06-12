export const format = {
    numberToFixed: (num?: number, digits = 2, commas = true) => {
        if (num === undefined) return num;
        if (!commas) return num.toFixed(digits);

        const fixed = parseFloat(num.toFixed(digits));
        return new Intl.NumberFormat().format(fixed);
    },
};