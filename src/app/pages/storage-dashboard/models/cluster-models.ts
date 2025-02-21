export type ElasticIndexTemplate = {
    hotRetentionDays: number;
    coldRetentionDays: number;
    elasticStorageGB: number;
    indices: string[];
}

export type IndexData = ElasticIndexTemplate & {
    name: string;
    hebrewName: string;
    elasticStoragePerHotTierDay: number;
    S3StoragePerColdTierDay: number;
    elasticStoragePerColdTierDay: number;
    S3StorageGB: number;
    totalRetentionDays: number;
};

export type ClusterMetadata = {
    name: string;
    hebrewName: string;
};

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
