export type ElasticIndexData = {
    hotRetentionDays: number;
    coldRetentionDays: number;
    elasticStorageGB: number;
}

export type IndexData = ElasticIndexData & {
    name: string;
    hebrewName: string;
    elasticStoragePerHotTierDay: number;
    S3StoragePerColdTierDay: number;
    elasticStoragePerColdTierDay: number;
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

export type Audience = 'developer' | 'user';

export type NewIndexInputType = 'frequency' | 'avgDocs' | 'import';

export type Direction = 'rtl' | 'ltr';

export type DisplayMethod = 'combined' | 'separate';

export type Translation = {
    title: string;
    developerMode: string;
    userMode: string;
    selectCluster: string;
    filterIndices: string;
    viewMode: string;
    editMode: string;
    changeLog: string;
    exportToFile: string;
    exportToEmail: string;
    storageUsageOverview: string;
    elasticsearchStorage: string;
    s3Storage: string;
    indexRetentionPeriods: string;
    indexRetentionManagement: string;
    addIndex: string;
    hotTierRetention: string;
    coldTierRetention: string;
    coldTierRetentionQuestion: string;
    totalRetentionPeriod: string;
    hotTier: string;
    coldTier: string;
    impact: string;
    noChanges: string;
    indexName: string;
    avgDocSize: string;
    inputType: string;
    docFrequency: string;
    avgDocs: string;
    cancel: string;
    addIndexButton: string;
    day: string;
    days: string;
    storage: string;
    overLimit: string;
    indexNamePlaceholder: string;
    removeIndex: string;
    perSecond: string;
    importFromIndex: string;
    importFromIndexPlaceholder: string;
    copyToClipboard: string;
    importFromFile: string;
    importFromText: string;
    import: string;
};
