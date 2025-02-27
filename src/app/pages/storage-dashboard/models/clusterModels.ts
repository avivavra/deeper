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
};

export type ClusterMetadata = {
    name: string;
    hebrewName: string;
};

// TODO: create an order between the measurement units
export type ElasticClusterStorage = {
    totalElasticStorage: number; // GB
    usedElasticStorage: number; // GB
};

export type S3ClusterStorage = {
    totalS3Storage: number; // GB
    usedS3Storage: number; // GB
};

export type ClusterStorage = ElasticClusterStorage & S3ClusterStorage;

export type ClusterData = ClusterMetadata & ClusterStorage;
