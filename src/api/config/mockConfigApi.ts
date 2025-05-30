import { ClustersConfig, ConfigApi } from "./configApi";

export class MockConfigApi implements ConfigApi {
    getClustersConfig = async () => {
        const clustersConfig: ClustersConfig = {
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
                        frequency: "daily",
                        canAddSources: false,
                        showToUsers: false
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
                        frequency: "daily",
                        canAddSources: false,
                        showToUsers: false
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
        };

        return new Promise<ClustersConfig>((resolve) => {
            setTimeout(() => resolve(clustersConfig), 1000);
        });
    };
}
