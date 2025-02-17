import { ClusterData, IndexData } from "@/app/pages/storage-dashboard/models";

export type ClustersApi = {
    getCluster: (name: string) => Promise<ClusterData>;
    getIndices: (clusterName: string) => Promise<IndexData[]>;
};