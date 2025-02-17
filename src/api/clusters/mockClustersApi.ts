import { ClusterData } from "@/app/pages/storage-dashboard/models";
import { ClustersApi } from "./clustersApi";
import { clusterAIndices, clusterBIndices, clusters } from "@/app/pages/storage-dashboard/exampleData";

export class MockClustersApi implements ClustersApi {
    getCluster(name: string): Promise<ClusterData> {
        const cluster = clusters.find(cluster => cluster.name === name);

        if (!cluster) {
            throw new Error(`Cluster not found: ${name}`);
        }

        return Promise.resolve(cluster);
    }

    getIndices(clusterName: string) {
        if (clusterName === 'Cluster A') {
            return Promise.resolve(clusterAIndices);
        } else if (clusterName === 'Cluster B') {
            return Promise.resolve(clusterBIndices);
        } else {
            throw new Error(`Cluster not found: ${clusterName}`);
        }
    }
}