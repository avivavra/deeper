export const config = {
    elasticColdTierMultiplier: 0.5, // down from 1 replica to 0 replicas
    s3ColdTierMultiplier: 0.7, // same data is takes up in S3 approximately 70% of the space it takes in elasticsearch
    storageThresholds: {
        high: 80,
        medium: 70
    },
    defaultMode: 'developer',
    normalIndicesThreshold: 0.5,
    s3Urls: {
        env1: ''
    },
    mailAddressees: ['example1@example.com', 'example2@example.com'],
    sourceFieldName: 'sourceName',
    sourcesTranslatorUrl: 'https://api.example.com/translate'
};
