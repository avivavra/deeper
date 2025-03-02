export const convert = {
    bytesToGB: (bytes: number) => bytes / 1024 / 1024 / 1024,
    kbToGB: (kb: number) => kb / 1024 / 1024,
    millisToDays: (milliseconds: number) => milliseconds / 1000 / 60 / 60 / 24,
    minutesToMillis: (minutes: number) => minutes * 60 * 1000,
    hoursToMillis: (hours: number) => hours * 60 * 60 * 1000,
    daysToMillis: (days: number) => days * 24 * 60 * 60 * 1000
}
