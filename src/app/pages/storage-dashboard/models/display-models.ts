export type Direction = 'rtl' | 'ltr';

export type Audience = 'developer' | 'user';

export type DisplayMethod = 'combined' | 'separate';

export type NewIndexInputType = 'frequency' | 'avgDocs' | 'import';

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
