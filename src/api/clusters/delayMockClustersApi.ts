import { ClusterData, IndexData } from "@/app/pages/storage-dashboard/models";
import { ClustersApi } from "./clustersApi";

export class DelayMockClustersApi implements ClustersApi {
    private clustersApi: ClustersApi;

    constructor(clustersApi: ClustersApi) {
        this.clustersApi = clustersApi;
    }

    getCluster(name: string): Promise<ClusterData> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.clustersApi.getCluster(name));
            }, 1500);
        });
    }

    getIndices(clusterName: string): Promise<IndexData[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.clustersApi.getIndices(clusterName));
            }, 1500);
        });
    }
}