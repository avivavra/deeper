import { ClusterStorage, IndexData } from "@/app/pages/storage-dashboard/models";

export type ClustersApi = {
    getClusterStorage: (name: string) => Promise<ClusterStorage>;
    getIndices: (clusterName: string) => Promise<IndexData[]>;
};