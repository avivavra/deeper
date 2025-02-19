export interface ElasticsearchClusterApi {
    getClusterStorage: () => Promise<{ totalStorage: number; usedStorage: number }>;
    getIndexTemplates: () => Promise<{ indexTemplate: string; hotRetentionDays: number; coldRetentionDays: number; storage: number; }[]>;
}
