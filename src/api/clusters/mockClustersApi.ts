import { ClusterData } from "@/app/pages/storage-dashboard/models";
import { ClustersApi } from "./clustersApi";
import { clusters } from "@/app/pages/storage-dashboard/exampleData";

export class MockClustersApi implements ClustersApi {
    getClusterNames() {
        return clusters.map(cluster => ({
            name: cluster.name,
            hebrewName: cluster.hebrewName
        }));
    };

    getCluster(name: string): Promise<ClusterData> {
        const cluster = clusters.find(cluster => cluster.name === name);

        if (!cluster) {
            throw new Error(`Cluster not found: ${name}`);
        }

        return Promise.resolve(cluster);
    }
}