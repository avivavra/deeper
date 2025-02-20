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
            indicesMetadata: [
                {
                    name: ".fleet-fileds-tohost-meta",
                    hebrewName: "אינדקס 1"
                },
                {
                    name: ".monitoring-ent-search-mb",
                    hebrewName: "אינדקס 2"
                },
                {
                    name: "synthetics-browser.screenshot",
                    hebrewName: "אינדקס 3"
                },
                {
                    name: "metrics-apm.app@template",
                    hebrewName: "אינדקס 4"
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
