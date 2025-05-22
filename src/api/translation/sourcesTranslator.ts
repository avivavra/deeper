import axios, { AxiosInstance } from 'axios';

export class SourcesTranslator {
    private client: AxiosInstance;

    constructor(url: string) {
        this.client = axios.create({ baseURL: url });
    }

    async translate(): Promise<{origin: string, translated: string}[]> {
        try {
            return Promise.resolve([{origin : 'source1', translated: 'מקור1'}]);
        } catch (error) {
            console.error('Error translating source name:', error);
            throw error;
        }
    }
}