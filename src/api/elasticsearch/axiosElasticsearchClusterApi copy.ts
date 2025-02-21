import axios, { AxiosInstance } from 'axios';

type IndexFrequency = 'daily' | 'monthly' | 'yearly';

type IndexTemplateConfig = {
    name: string;
    hebrewName: string;
    frequency: IndexFrequency;
};

type IndexTemplate = {
    name: string;
    hebrewName: string;
    hotRetentionDays: number;
    coldRetentionDays: number;
    hotTierStorage: number;
    coldTierStorage: number;
    hotTierStoragePerDay: number;
    coldTierStoragePerDay: number;
    indexNamesByTier: {
        hotTier: string[];
        coldTier: string[];
    }
};

type Index = {
    name: string;
    creationTime: Date;
    docsCount: number;
    storage: number;
};

type Tier = 'hot' | 'warm' | 'cold' | 'frozen';

type IlmPolicy = {
    name: string;
    hotTierRetentionPeriod: number;
    warmTierRetentionPeriod: number;
    coldTierRetentionPeriod: number;
    frozenTierRetentionPeriod: number;
};

export class AxiosElasticsearchClusterApi {
    private axiosInstance: AxiosInstance;
    private indexTemplatesConfig: IndexTemplateConfig[];

    constructor(url: string, username: string, password: string, indexTemplatesConfig: IndexTemplateConfig[]) {
        this.axiosInstance = axios.create({
            baseURL: url,
            auth: {
                username,
                password
            }
        });

        this.indexTemplatesConfig = indexTemplatesConfig;
    }

    async getIndexTemplates(): Promise<IndexTemplate[]> {
        const now = new Date();

        const templates = await this.fetchIndexTemplates();
        const indices = await this.fetchIndices();
        const ilmPolicies = await this.fetchIlmPolicies();

        const indexTemplates = this.indexTemplatesConfig.map((indexTemplate): IndexTemplate => {
            const template = templates.find(template => template.name === indexTemplate.name);
            if (!template) throw new Error(`Index template ${indexTemplate.name} not found`);

            const matchingIlmPolicy = ilmPolicies.find(policy => policy.name === template.ilmPolicy);
            if (!matchingIlmPolicy) throw new Error(`Ilm policy ${template.ilmPolicy} not found`);

            const matchingIndices = this.getMatchingIndices(indices, template.patterns);
            const normalIndices = this.getNormalIndices(matchingIndices);

            const indicesByTier = this.mapByTier(normalIndices, matchingIlmPolicy, now);

            const hotTierIndices = [...(indicesByTier.hot || []), ...(indicesByTier.warm || [])];
            const coldTierIndices = [...(indicesByTier.cold || []), ...(indicesByTier.frozen || [])];

            const hotRetentionDays = matchingIlmPolicy.hotTierRetentionPeriod + matchingIlmPolicy.warmTierRetentionPeriod;
            const coldRetentionDays = matchingIlmPolicy.coldTierRetentionPeriod + matchingIlmPolicy.frozenTierRetentionPeriod;

            const hotTierStorage = hotTierIndices.reduce((acc, index) => acc + index.storage, 0);
            const coldTierStorage = coldTierIndices.reduce((acc, index) => acc + index.storage, 0);

            const hotTierStoragePerDay = this.getAverageStoragePerDayMultiple(hotTierIndices, indexTemplate.frequency, now);
            const coldTierStoragePerDay = this.getAverageStoragePerDayMultiple(coldTierIndices, indexTemplate.frequency, now);

            return {
                name: template.name,
                hebrewName: indexTemplate.hebrewName,
                hotRetentionDays,
                coldRetentionDays,
                hotTierStorage,
                coldTierStorage,
                hotTierStoragePerDay,
                coldTierStoragePerDay,
                indexNamesByTier: {
                    hotTier: hotTierIndices.map(index => index.name),
                    coldTier: coldTierIndices.map(index => index.name)
                }
            }
        });

        return indexTemplates;
    }

    private async fetchIndexTemplates(): Promise<{
        name: string;
        patterns: string[];
        ilmPolicy: string;
    }[]> {
        throw new Error('Not Implemented');
    }

    private async fetchIndices(): Promise<Index[]> {
        throw new Error('Not Implemented');
    }

    private async fetchIlmPolicies(): Promise<IlmPolicy[]> {
        throw new Error('Not Implemented');
    }

    private getMatchingIndices(indices: Index[], patterns: string[]): Index[] {
        throw new Error('Not Implemented');
    }

    private getNormalIndices(indices: Index[]): Index[] {
        throw new Error('Not Implemented');
    }

    private calculateTier(index: Index, ilmPolicy: IlmPolicy, now: Date): Tier {
        throw new Error('Not Implemented');
    }

    private mapByTier(indices: Index[], ilmPolicy: IlmPolicy, now: Date): Record<Tier, Index[]> {
        return indices.reduce((acc, index) => {
            const tier = this.calculateTier(index, ilmPolicy, now);
            if (!acc[tier]) {
                acc[tier] = [];
            }
            acc[tier].push(index);
            return acc;
        }, {} as Record<Tier, Index[]>);
    }

    private getAverageStoragePerDay(index: Index, indexFrequency: IndexFrequency, now: Date): number {
        throw new Error('Not Implemented');
    }

    private getAverageStoragePerDayMultiple(indices: Index[], indexFrequency: IndexFrequency, now: Date): number {
        if (indices.length === 0) return 0;

        return indices.reduce((acc, index) => {
            return acc + this.getAverageStoragePerDay(index, indexFrequency, now);
        }, 0) / indices.length;
    }
}
