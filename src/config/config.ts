export const config = {
    elasticColdTierMultiplier: 0.5, // down from 1 replica to 0 replicas
    s3ColdTierMultiplier: 0.7, // same data is takes up in S3 approximately 70% of the space it takes in elasticsearch
    storageThresholds: {
        high: 80,
        medium: 70
    },
    defaultMode: 'developer',
    normalIndicesThreshold: 0.5,
    clustersConnection: {
        'Cluster A': {
            name: 'Cluster A',
            hebrewName: 'אשכול A',
            url: 'elasticsearch/local',
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
            ]
        }
    }
};
