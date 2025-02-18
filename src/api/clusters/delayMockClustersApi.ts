import { ClusterData, ClusterStorage, IndexData } from "@/app/pages/storage-dashboard/models";
import { ClustersApi } from "./clustersApi";

export class DelayMockClustersApi implements ClustersApi {
    private clustersApi: ClustersApi;

    constructor(clustersApi: ClustersApi) {
        this.clustersApi = clustersApi;
    }

    getClusterStorage(name: string): Promise<ClusterStorage> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.clustersApi.getClusterStorage(name));
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