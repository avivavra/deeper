export type Source = {
    name: string;
    relatedSourceGroup: string;
    elasticStorage: number;
    S3Storage: number;
    elasticStoragePerHotTierDay: number;
    elasticStoragePerColdTierDay: number;
    S3StoragePerColdTierDay: number;
};

export type SourceGroup = {
    name: string;
    hebrewName: string;
    hotRetentionDays: number;
    coldRetentionDays: number;
    initialHotRetentionDays: number;
    initialColdRetentionDays: number;
    totalRetentionDays: number;
    elasticStorage: number;
    S3Storage: number;
    elasticStoragePerHotTierDay: number;
    elasticStoragePerColdTierDay: number;
    S3StoragePerColdTierDay: number;
    indexNamesByTier: {
        hotTier: string[];
        coldTier: string[];
    };
    sourceNames: string[];
    canAddSources: boolean;
    showToUsers: boolean;
};

export type ClusterMetadata = {
    name: string;
    hebrewName: string;
};

export type ElasticClusterStorage = {
    /** GB */
    totalElasticStorage: number;
    /** GB */
    usedElasticStorage: number;
};

export type S3ClusterStorage = {
    /** GB */
    totalS3Storage: number;
    /** GB */
    usedS3Storage: number;
};

export type ClusterStorage = ElasticClusterStorage & S3ClusterStorage;

export type ClusterData = ClusterMetadata & ClusterStorage;
