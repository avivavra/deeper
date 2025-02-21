export type IndexTemplateData = {
    indexTemplate: string;
    hotRetentionDays: number;
    coldRetentionDays: number;
    hotTierStorage: number;
    coldTierStorage: number;
}

export interface ElasticsearchClusterApi {
    getClusterStorage: () => Promise<{ totalStorage: number; usedStorage: number }>;
    getIndexTemplates: () => Promise<IndexTemplateData[]>;
}
