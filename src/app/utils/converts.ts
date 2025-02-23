export const convertBytesToGB = (bytes: number): number => {
    return bytes / 1024 / 1024 / 1024;
};

export const convertKBToGB = (kb: number): number => {
    return kb / 1024 / 1024;
};

export const convertToDays = (milliseconds: number): number => {
    return milliseconds / 1000 / 60 / 60 / 24;
};
