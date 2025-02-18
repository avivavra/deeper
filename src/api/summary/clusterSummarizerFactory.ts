import { ClusterSummarizer } from "./clusterSummarizer";

export interface ClusterSummarizerFactory {
    createSummarizer: (clusterName: string) => ClusterSummarizer;
}