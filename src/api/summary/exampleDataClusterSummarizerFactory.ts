import { clusterAIndices, clusterBIndices, clusterA, clusterB } from "../exampleData";
import { ClusterSummarizer } from "./clusterSummarizer";
import { ClusterSummarizerFactory } from "./clusterSummarizerFactory";

export class ExampleDataClusterSummarizerFactory implements ClusterSummarizerFactory {
    createSummarizer(clusterName: string) {
        if (clusterName === 'Cluster A') {
            return {
                summarize: () => Promise.resolve(clusterA),
                summarizeSourceGroups: () => Promise.resolve(clusterAIndices)
            } as ClusterSummarizer;
        } else if (clusterName === 'Cluster B') {
            return {
                summarize: () => Promise.resolve(clusterB),
                summarizeSourceGroups: () => Promise.resolve(clusterBIndices)
            } as ClusterSummarizer;
        } else {
            throw new Error(`Cluster ${clusterName} not found`);
        }
    }
}
