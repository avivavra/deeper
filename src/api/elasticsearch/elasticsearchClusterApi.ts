export type IndexTemplate = {
    name: string;
    patterns: string[];
    ilmPolicy?: string;
};

export type Index = {
    name: string;
    creationTime: Date;
    docsCount: number;
    /** GB */
    storage: number;
};

export type IlmPolicy = {
    name: string;
    hotTierRetentionPeriod: number;
    warmTierRetentionPeriod: number;
    coldTierRetentionPeriod: number;
    frozenTierRetentionPeriod: number;
};

export interface ElasticsearchClusterApi {
    fetchClusterStorage: () => Promise<{
        /** GB */
        totalStorage: number;
        /** GB */
        usedStorage: number
    }>;
    fetchIndexTemplates: () => Promise<IndexTemplate[]>;
    fetchIndices: () => Promise<Index[]>;
    fetchIlmPolicies: () => Promise<IlmPolicy[]>;
    fetchSourceNames: (indexName: string) => Promise<string[]>;
}
