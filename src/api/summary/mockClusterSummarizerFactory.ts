import { ClusterSummarizerFactory } from "./clusterSummarizerFactory";
import { MockAClusterSummarizer } from "./mockAClusterSummarizer";
import { MockBClusterSummarizer } from "./mockBClusterSummarizer";

export class MockClusterSummarizerFactory implements ClusterSummarizerFactory {
    createSummarizer = (clusterName: string) => {
        if (clusterName === "Cluster A") {
            return new MockAClusterSummarizer();
        } else if (clusterName === "Cluster B") {
            return new MockBClusterSummarizer();
        } else {
            throw new Error("Unknown cluster name");
        }
    }
}
