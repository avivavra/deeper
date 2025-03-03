import { ClusterData, ClusterMetadata, SourceGroup } from "../../app/pages/storage-dashboard/models";
import { ElasticsearchClusterApi, IlmPolicy, Index, IndexTemplate } from "../elasticsearch";
import { S3BucketApi } from "../s3";
import { convert } from "../../app/utils";
import { config } from "../../config";

type IndexFrequency = 'daily' | 'monthly' | 'yearly';

export type IndexTemplateConfig = {
    name: string;
    hebrewName: string;
    frequency: IndexFrequency;
};

type ProcessedIndexTemplate = {
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

    async summarizeSourceGroups(): Promise<SourceGroup[]> {
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
                initialHotRetentionDays: indexTemplate.hotRetentionDays,
                initialColdRetentionDays: indexTemplate.coldRetentionDays,
                totalRetentionDays: indexTemplate.hotRetentionDays + indexTemplate.coldRetentionDays,
                elasticStorage: indexTemplate.hotTierStorage + indexTemplate.coldTierStorage,
                elasticStoragePerHotTierDay: indexTemplate.hotTierStoragePerDay,
                elasticStoragePerColdTierDay: indexTemplate.coldTierStoragePerDay,
                S3StoragePerColdTierDay: indexTemplate.coldTierStoragePerDay * 0.6, // TODO: implement
                S3Storage: matchingFolder.storage,
                indexNamesByTier: indexTemplate.indexNamesByTier,
            };
        });
    }

    private async getIndexTemplates(): Promise<ProcessedIndexTemplate[]> {
        const now = new Date();

        const templates = await this.elasticsearchClusterApi.fetchIndexTemplates();
        const indices = await this.elasticsearchClusterApi.fetchIndices();
        const ilmPolicies = await this.elasticsearchClusterApi.fetchIlmPoliciesWithDeletePhase();

        const indexTemplates = this.indexTemplatesConfig.map((templateConfig): ProcessedIndexTemplate => {
            const template = templates.find(template => template.name === templateConfig.name);
            if (!template) throw new Error(`Index template ${templateConfig.name} not found`);

            const matchingIlmPolicy = ilmPolicies.find(policy => policy.name === template.ilmPolicy);
            if (!matchingIlmPolicy) throw new Error(`Ilm policy ${template.ilmPolicy} does not exist or does not a delete phase`);

            const hotTierIndices = this.getMatchingHotTierIndices(indices, template.patterns);
            if (hotTierIndices.length === 0) console.warn(`No hot tier indices found for index template ${templateConfig.name}`);
    
            const coldTierIndices = this.getMatchingColdTierIndices(indices, template.patterns);
            if (matchingIlmPolicy.coldTierRetentionPeriod > 0 && coldTierIndices.length === 0) {
                console.warn(`No cold tier indices found for index template ${templateConfig.name}, although cold tier retention period is ${matchingIlmPolicy.coldTierRetentionPeriod}`);
            }

            return this.summarizeIndexTemplate(templateConfig, matchingIlmPolicy, hotTierIndices, coldTierIndices, now);
        });

        return indexTemplates;
    }

    summarizeIndexTemplate(
        { name, hebrewName, frequency }: IndexTemplateConfig,
        ilmPolicy: IlmPolicy,
        hotTierIndices: Index[],
        coldTierIndices: Index[],
        now: Date
    ): ProcessedIndexTemplate {
        const normalHotTierIndices = this.getNormalIndices(hotTierIndices);
        const normalColdTierIndices = this.getNormalIndices(coldTierIndices);

        const hotRetentionDays = convert.millisToDays(ilmPolicy.hotTierRetentionPeriod + ilmPolicy.warmTierRetentionPeriod);
        const coldRetentionDays = convert.millisToDays(ilmPolicy.coldTierRetentionPeriod + ilmPolicy.frozenTierRetentionPeriod);

        const hotTierStorage = normalHotTierIndices.reduce((acc, index) => acc + index.storage, 0);
        const coldTierStorage = normalColdTierIndices.reduce((acc, index) => acc + index.storage, 0);

        const hotTierStoragePerDay = this.getAverageStoragePerDayMultiple(normalHotTierIndices, frequency, now);
        const coldTierStoragePerDay = this.getAverageStoragePerDayMultiple(normalColdTierIndices, frequency, now);

        return {
            name,
            hebrewName,
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
    };

    private getMatchingHotTierIndices(indices: Index[], patterns: string[]): Index[] {
        return indices.filter(index =>
            patterns.some(pattern => this.matchesPattern(index.name, pattern))
        );
    }

    private getMatchingColdTierIndices(indices: Index[], patterns: string[]): Index[] {
        return indices.filter(index =>
            patterns.some(pattern => this.matchesPattern(index.name, 'restored-' + pattern))
        );
    }

    private matchesPattern(indexName: string, pattern: string): boolean {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(indexName);
    }

    private getNormalIndices(indices: Index[]): Index[] {
        const averageDocsCount = indices.reduce((acc, index) => acc + index.storage, 0) / indices.length;
        const threshold = averageDocsCount * config.normalIndicesThreshold;

        return indices.filter(index => index.docsCount >= threshold);
    }

    private getAverageStoragePerDay(index: Index, indexFrequency: IndexFrequency, now: Date): number {
        const daysSinceCreation = convert.millisToDays(now.getTime() - index.creationTime.getTime());

        switch (indexFrequency) {
            case 'daily':
                if (daysSinceCreation > 1) return index.storage;
                return index.storage / daysSinceCreation;
            case 'monthly':
                const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const daysInLastMonth = convert.millisToDays(thisMonthStart.getTime() - lastMonthStart.getTime());

                const aMonthHasPassed = daysSinceCreation > daysInLastMonth;
                if (aMonthHasPassed) return index.storage / daysInLastMonth;

                return index.storage / daysSinceCreation;
            case 'yearly':
                const lastYearStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                const thisYearStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const daysInLastYear = convert.millisToDays(thisYearStart.getTime() - lastYearStart.getTime());

                const aYearHasPassed = daysSinceCreation > daysInLastYear;
                if (aYearHasPassed) return index.storage / daysInLastYear;

                return index.storage / daysSinceCreation;
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
