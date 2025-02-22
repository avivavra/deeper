import { clusterAIndices, clusterBIndices, clusterA, clusterB } from "../exampleData";
import { ClusterSummarizer } from "./clusterSummarizer";
import { ClusterSummarizerFactory } from "./clusterSummarizerFactory";

export class ExampleDataClusterSummarizerFactory implements ClusterSummarizerFactory {
    createSummarizer(clusterName: string) {
        if (clusterName === 'Cluster A') {
            return {
                summarize: () => Promise.resolve(clusterA),
                summarizeIndices: () => Promise.resolve(clusterAIndices)
            } as ClusterSummarizer;
        } else if (clusterName === 'Cluster B') {
            return {
                summarize: () => Promise.resolve(clusterB),
                summarizeIndices: () => Promise.resolve(clusterBIndices)
            } as ClusterSummarizer;
        } else {
            throw new Error(`Cluster ${clusterName} not found`);
        }
    }
}
