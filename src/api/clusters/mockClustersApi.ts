import { ClusterData, ClusterStorage } from "@/app/pages/storage-dashboard/models";
import { ClustersApi } from "./clustersApi";
import { clusterAIndices, clusterBIndices, clusters } from "./exampleData";

export class MockClustersApi implements ClustersApi {
    getClusterStorage(name: string): Promise<ClusterStorage> {
        const cluster = clusters.find(cluster => cluster.name === name);

        if (!cluster) {
            throw new Error(`Cluster not found: ${name}`);
        }

        return Promise.resolve({
            totalElasticStorage: cluster.totalElasticStorage,
            totalS3Storage: cluster.totalS3Storage,
            usedElasticStorage: cluster.usedElasticStorage,
            usedS3Storage: cluster.usedS3Storage
        });
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