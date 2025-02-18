import { ClusterData, IndexData } from "@/app/pages/storage-dashboard/models";
import { ClusterSummarizer } from "./clusterSummarizer";
import { clusterBIndices, clusters } from "../exampleData";

export class MockBClusterSummarizer implements ClusterSummarizer {
    summarize(): Promise<ClusterData> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(clusters.find(cluster => cluster.name === 'Cluster B') as ClusterData);
            }, 1000);
        });
    }

    summarizeIndices(): Promise<IndexData[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(clusterBIndices);
            }, 1000);
        });
    }
}
