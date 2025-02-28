export type Direction = 'rtl' | 'ltr';

export type Audience = 'developer' | 'user';

export type StoragePerDayInputType = 'frequency' | 'avgDocs' | 'import';

export type SourceGroupChange = {
    type: 'sourceGroup';
    name: string;
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

export type SourceChange = {
    type: 'source';
    name: string;
    relatedSourceGroup: string;
    original: {
        elasticStorage: number;
        s3Storage: number;
    };
    current: {
        elasticStorage: number;
        s3Storage: number;
        elasticStoragePerHotTierDay: number;
        elasticStoragePerColdTierDay: number;
        S3StoragePerColdTierDay: number;
    };
};

export type ChangeLogEntry = SourceGroupChange | SourceChange;

export type Translation = {
    title: string;
    developerMode: string;
    userMode: string;
    selectCluster: string;
    filterSourceGroups: string;
    viewMode: string;
    simulation: string;
    changeLog: string;
    exportToFile: string;
    exportToEmail: string;
    storageUsageOverview: string;
    elasticsearchStorage: string;
    s3Storage: string;
    retentionPeriods: string;
    retentionManagement: string;
    addSourceGroup: string;
    hotTierRetention: string;
    coldTierRetention: string;
    coldTierRetentionQuestion: string;
    totalRetentionPeriod: string;
    hotTier: string;
    coldTier: string;
    impact: string;
    noChanges: string;
    sourceGroupName: string;
    avgDocSize: string;
    inputType: string;
    docFrequency: string;
    avgDocs: string;
    cancel: string;
    addSourceGroupButton: string;
    day: string;
    days: string;
    storage: string;
    sourceGroupNamePlaceholder: string;
    removeSourceGroup: string;
    perSecond: string;
    importFromSourceGroup: string;
    importFromSourceGroupPlaceholder: string;
    copyToClipboard: string;
    importFromFile: string;
    importFromText: string;
    import: string;
    addSource: string;
    sourceName: string;
    sourceNamePlaceholder: string;
    sourceNameError: string;
    addSourceButton: string;
    addSourceGroupExplanation: string;
    addSourceExplanation: string;
    elasticsearchStorageExplanation: string;
    s3StorageExplanation: string;
};
