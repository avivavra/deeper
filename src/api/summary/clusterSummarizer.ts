import { ClusterData, IndexData } from "@/app/pages/storage-dashboard/models";

export interface ClusterSummarizer {
    summarize: () => Promise<ClusterData>;
    summarizeIndices: () => Promise<IndexData[]>;
};
