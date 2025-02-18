import { ClusterData, IndexData } from "@/app/pages/storage-dashboard/models";
import { ClusterSummarizer } from "./clusterSummarizer";
import { clusterAIndices, clusters } from "../exampleData";

export class MockAClusterSummarizer implements ClusterSummarizer {
    summarize(): Promise<ClusterData> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(clusters.find(cluster => cluster.name === 'Cluster A') as ClusterData);
            }, 1000);
        });
    }

    summarizeIndices(): Promise<IndexData[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(clusterAIndices);
            }, 1000);
        });
    }
}
