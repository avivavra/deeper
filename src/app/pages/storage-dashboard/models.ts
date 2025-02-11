export type IndexData = {
    name: string;
    hebrewName: string;
    elasticStoragePerHotTierDay: number;
    S3StoragePerColdTierDay: number;
    elasticStoragePerColdTierDay: number;
    hotRetentionDays: number;
    coldRetentionDays: number;
    elasticStorageGB: number;
    S3StorageGB: number;
    totalRetentionDays: number;
};

export type ChangeLogEntry = {
    original: {
        hotDays: number;
        coldDays: number;
        elasticStorage: number;
        s3Storage: number;
    };
    current: {
        hotDays: number;
        coldDays: number;
        elasticStorage: number;
        s3Storage: number;
    };
};

export type ClusterData = {
    name: string;
    indices: IndexData[];
};

export type Audience = 'developer' | 'user';
