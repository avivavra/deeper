export const config = {
    hotTierMultiplier: 0.75,
    coldTierMultiplier: 0.05,
    storageThresholds: {
        high: 80,
        medium: 70
    },
    defaultMode: 'developer',
    combineForUser: false,
    clustersConnection: {
        'Cluster A': {
            name: 'Cluster A',
            hebrewName: 'אשכול A',
            url: 'elasticsearch/local',
            username: 'elastic',
            password: 'y6WgXosR',
            indexTemplatesConfig: [
                {
                    name: ".fleet-fileds-tohost-meta",
                    hebrewName: "אינדקס 1",
                    frequency: "daily"
                },
                {
                    name: ".monitoring-ent-search-mb",
                    hebrewName: "אינדקס 2",
                    frequency: "monthly"
                },
                {
                    name: ".fleet-fileds-fromhost-data",
                    hebrewName: "אינדקס 3",
                    frequency: "daily"
                },
                {
                    name: ".alerts-observability.metrics.alerts-default-index-template",
                    hebrewName: "אינדקס 4",
                    frequency: "daily"
                }
            ]
        },
        // 'clusterB': {
        //     name: 'Cluster B',
        //     hebrewName: 'אשכול B',
        //     url: 'https://clusterA.com',
        // }
    }
};
