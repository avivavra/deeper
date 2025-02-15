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

export type NewIndex = {
    name: string;
    docSize: string;
    frequency: string;
    avgDocs: string;
    inputType: NewIndexInputType;
    totalRetention: string;
    coldRetention: string;
    importFromIndex: string;
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
    hebrewName: string;
    indices: IndexData[];
};

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
