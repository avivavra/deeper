import { ClusterData, ClusterMetadata, IndexData } from "@/app/pages/storage-dashboard/models";
import { ElasticsearchClusterApi, IlmPolicy, Index } from "../elasticsearch";
import { S3BucketApi } from "../s3";
import { convertToDays } from "@/app/utils";

type IndexFrequency = 'daily' | 'monthly' | 'yearly';

export type IndexTemplateConfig = {
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

type Tier = 'hot' | 'warm' | 'cold' | 'frozen' | 'delete';

export class ClusterSummarizer {
    constructor(
        private readonly clusterMetadata: ClusterMetadata,
        private indexTemplatesConfig: IndexTemplateConfig[],
        private readonly elasticsearchClusterApi: ElasticsearchClusterApi,
        private readonly s3BucketApi: S3BucketApi
    ) { }

    async summarize(): Promise<ClusterData> {
        const [elasticsearchStorage, s3Storage] = await Promise.all([
            this.elasticsearchClusterApi.fetchClusterStorage(),
            this.s3BucketApi.getStorage()
        ]);

        return {
            ...this.clusterMetadata,
            totalElasticStorage: elasticsearchStorage.totalStorage,
            usedElasticStorage: elasticsearchStorage.usedStorage,
            totalS3Storage: s3Storage.totalS3Storage,
            usedS3Storage: s3Storage.usedS3Storage
        };
    }

    async summarizeIndices(): Promise<IndexData[]> {
        const [elasticIndexTemplates, s3Folders] = await Promise.all([
            this.getIndexTemplates(),
            this.s3BucketApi.getFolders()
        ]);

        return elasticIndexTemplates.map(indexTemplate => {
            const matchingFolder = s3Folders.find(folder => folder.name === indexTemplate.name);
            if (!matchingFolder) throw new Error(`No S3 folder found for index template ${indexTemplate.name}`);

            return {
                name: indexTemplate.name,
                hebrewName: indexTemplate.hebrewName,
                hotRetentionDays: indexTemplate.hotRetentionDays,
                coldRetentionDays: indexTemplate.coldRetentionDays,
                totalRetentionDays: indexTemplate.hotRetentionDays + indexTemplate.coldRetentionDays,
                elasticStorage: indexTemplate.hotTierStorage + indexTemplate.coldTierStorage,
                elasticStoragePerHotTierDay: indexTemplate.hotTierStoragePerDay,
                elasticStoragePerColdTierDay: indexTemplate.coldTierStoragePerDay,
                S3StoragePerColdTierDay: indexTemplate.coldTierStoragePerDay * 0.6, // TODO: implement
                S3Storage: matchingFolder.storage,
                indexNamesByTier: indexTemplate.indexNamesByTier
            };
        });
    }

    private async getIndexTemplates(): Promise<IndexTemplate[]> {
        const now = new Date();

        const templates = await this.elasticsearchClusterApi.fetchIndexTemplates();
        const indices = await this.elasticsearchClusterApi.fetchIndices();
        const ilmPolicies = await this.elasticsearchClusterApi.fetchIlmPoliciesWithDeletePhase();

        const indexTemplates = this.indexTemplatesConfig.map((indexTemplate): IndexTemplate => {
            const template = templates.find(template => template.name === indexTemplate.name);
            if (!template) throw new Error(`Index template ${indexTemplate.name} not found`);

            const matchingIlmPolicy = ilmPolicies.find(policy => policy.name === template.ilmPolicy);
            if (!matchingIlmPolicy) throw new Error(`Ilm policy ${template.ilmPolicy} does not exist or does not a delete phase`);

            const matchingIndices = this.getMatchingIndices(indices, template.patterns); // TODO: add warning for strange index template (no indices, ...)
            const normalIndices = this.getNormalIndices(matchingIndices);

            const normalIndicesByTier = this.mapByTier(normalIndices, matchingIlmPolicy, now);

            const normalHotTierIndices = [...(normalIndicesByTier.hot || []), ...(normalIndicesByTier.warm || [])];
            const normalColdTierIndices = [...(normalIndicesByTier.cold || []), ...(normalIndicesByTier.frozen || [])];

            const hotRetentionDays = convertToDays(matchingIlmPolicy.hotTierRetentionPeriod + matchingIlmPolicy.warmTierRetentionPeriod);
            const coldRetentionDays = convertToDays(matchingIlmPolicy.coldTierRetentionPeriod + matchingIlmPolicy.frozenTierRetentionPeriod);

            const hotTierStorage = normalHotTierIndices.reduce((acc, index) => acc + index.storage, 0);
            const coldTierStorage = normalColdTierIndices.reduce((acc, index) => acc + index.storage, 0);

            const hotTierStoragePerDay = this.getAverageStoragePerDayMultiple(normalHotTierIndices, indexTemplate.frequency, now);
            const coldTierStoragePerDay = this.getAverageStoragePerDayMultiple(normalColdTierIndices, indexTemplate.frequency, now);

            const indicesByTier = this.mapByTier(matchingIndices, matchingIlmPolicy, now);

            const hotTierIndices = [...(indicesByTier.hot || []), ...(indicesByTier.warm || [])];
            const coldTierIndices = [...(indicesByTier.cold || []), ...(indicesByTier.frozen || [])];

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

    private getMatchingIndices(indices: Index[], patterns: string[]): Index[] {
        return indices.filter(index =>
            patterns.some(pattern => this.matchesPattern(index.name, pattern))
        );
    }

    private matchesPattern(indexName: string, pattern: string): boolean {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(indexName);
    }

    private getNormalIndices(indices: Index[]): Index[] {
        const averageDocsCount = indices.reduce((acc, index) => acc + index.docsCount, 0) / indices.length;
        const threshold = averageDocsCount / 2;

        return indices.filter(index => index.docsCount >= threshold);
    }

    private calculateTier(index: Index, ilmPolicy: IlmPolicy, now: Date): Tier {
        const creationTime = new Date(index.creationTime).getTime();
        const nowTime = now.getTime();

        const hotTierEnd = creationTime + ilmPolicy.hotTierRetentionPeriod;
        const warmTierEnd = hotTierEnd + ilmPolicy.warmTierRetentionPeriod;
        const coldTierEnd = warmTierEnd + ilmPolicy.coldTierRetentionPeriod;
        const frozenTierEnd = coldTierEnd + ilmPolicy.frozenTierRetentionPeriod;

        if (nowTime <= hotTierEnd) {
            return 'hot';
        } else if (nowTime <= warmTierEnd) {
            return 'warm';
        } else if (nowTime <= coldTierEnd) {
            return 'cold';
        } else if (nowTime <= frozenTierEnd) {
            return 'frozen';
        } else {
            return 'delete';
        }
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
        const daysSinceCreation = convertToDays(now.getTime() - index.creationTime.getTime());

        switch (indexFrequency) {
            case 'daily':
                if (daysSinceCreation > 1) return index.storage;
                return index.storage / daysSinceCreation;
            case 'monthly':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const daysInLastMonth = convertToDays(now.getTime() - lastMonth.getTime());

                if (daysSinceCreation > daysInLastMonth) return index.storage;
                return index.storage / (daysSinceCreation / daysInLastMonth);
            case 'yearly':
                const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                const daysInLastYear = convertToDays(now.getTime() - lastYear.getTime());

                if (daysSinceCreation > daysInLastYear) return index.storage;
                return index.storage / (daysSinceCreation / daysInLastYear);
            default:
                throw new Error(`Unknown index frequency: ${indexFrequency}`);
        }
    }

    private getAverageStoragePerDayMultiple(indices: Index[], indexFrequency: IndexFrequency, now: Date): number {
        if (indices.length === 0) return 0;

        return indices.reduce((acc, index) => {
            return acc + this.getAverageStoragePerDay(index, indexFrequency, now);
        }, 0) / indices.length;
    }
};
