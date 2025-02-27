export const config = {
    elasticColdTierMultiplier: 0.5,
    s3ColdTierMultiplier: 0.5 * 0.6,
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
