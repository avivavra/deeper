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
    clustersConnection: {
        'Cluster A': {
            name: 'Cluster A',
            hebrewName: 'אשכול A',
            url: 'elasticsearch/local',
            bucketName: 'Bucket A',
            username: 'elastic',
            password: 'y6WgXosR',
            indexTemplatesConfig: [
                {
                    name: "test-template",
                    hebrewName: "אינדקס 1",
                    frequency: "daily"
                },
                {
                    name: ".fleet-fileds-tohost-meta",
                    hebrewName: "אינדקס 2",
                    frequency: "daily"
                },
                {
                    name: ".monitoring-ent-search-mb",
                    hebrewName: "אינדקס 3",
                    frequency: "monthly"
                },
                {
                    name: ".fleet-fileds-fromhost-data",
                    hebrewName: "אינדקס 4",
                    frequency: "daily"
                }
            ],
        },
        'Cluster B': {
            name: 'Cluster B',
            hebrewName: 'אשכול B',
            url: 'elasticsearch/remote',
            bucketName: 'Bucket B',
            username: 'elastic',
            password: 'y6WgXosR',
            indexTemplatesConfig: [
                {
                    name: "test-template-2",
                    hebrewName: "אינדקס 5",
                    frequency: "daily"
                },
                {
                    name: ".fleet-fileds-tohost-meta-2",
                    hebrewName: "אינדקס 6",
                    frequency: "daily"
                },
                {
                    name: ".monitoring-ent-search-mb-2",
                    hebrewName: "אינדקס 7",
                    frequency: "monthly"
                },
                {
                    name: ".fleet-fileds-fromhost-data-2",
                    hebrewName: "אינדקס 8",
                    frequency: "daily"
                }
            ],
            thresholdMode: 50 // Custom threshold mode (50%)
        }
    }
};
