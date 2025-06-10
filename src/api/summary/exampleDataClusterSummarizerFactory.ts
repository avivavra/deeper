import { clusterAIndices, clusterBIndices, clusterA, clusterB } from "../exampleData";
import { ClusterSummarizer } from "./clusterSummarizer";
import { ClusterSummarizerFactory } from "./clusterSummarizerFactory";

export class ExampleDataClusterSummarizerFactory implements ClusterSummarizerFactory {
    createSummarizer(clusterName: string) {
        if (clusterName === 'Cluster A') {
            return {
                summarize: () => Promise.resolve(clusterA),
                summarizeSourceGroups: () => Promise.resolve(clusterAIndices),
                summarizeExtendedElasticStorage: () => Promise.resolve({
                    hotTierStorage: 100,
                    coldTierStorage: 50
                })
            } as ClusterSummarizer;
        } else if (clusterName === 'Cluster B') {
            return {
                summarize: () => Promise.resolve(clusterB),
                summarizeSourceGroups: () => Promise.resolve(clusterBIndices),
                summarizeExtendedElasticStorage: () => Promise.resolve({
                    hotTierStorage: 200,
                    coldTierStorage: 100
                })
            } as ClusterSummarizer;
        } else {
            throw new Error(`Cluster ${clusterName} not found`);
        }
    }
}
