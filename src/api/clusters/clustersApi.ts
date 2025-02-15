import { ClusterData } from "@/app/pages/storage-dashboard/models";

export type ClustersApi = {
    getClusterNames: () => { name: string; hebrewName: string; }[];
    getCluster: (name: string) => Promise<ClusterData>;
};