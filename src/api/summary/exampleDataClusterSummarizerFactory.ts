import { ElasticsearchClusterApiFactory } from "../elasticsearch/elasticsearchClusterApiFactory";
import { clusterAIndices, clusterBIndices, clusters } from "../exampleData";
import { S3BucketApiFactory } from "../s3/s3BucketApiFactory";
import { ClusterSummarizer } from "./clusterSummarizer";
import { ClusterSummarizerFactory } from "./clusterSummarizerFactory";

export class ExampleDataClusterSummarizerFactory implements ClusterSummarizerFactory {
    constructor(
        private readonly elasticsearchClusterApiFactory: ElasticsearchClusterApiFactory,
        private readonly s3BucketApiFactory: S3BucketApiFactory
    ) { }

    createSummarizer(clusterName: string) {
        if (clusterName === "Cluster A") {
            const cluster = clusters.find(c => c.name === "Cluster A");
            if (!cluster) {
                throw new Error("Cluster not found");
            }
            return new ClusterSummarizer(
                { name: cluster.name, hebrewName: cluster.hebrewName },
                clusterAIndices.map(index => ({ name: index.name, hebrewName: index.hebrewName })),
                this.elasticsearchClusterApiFactory.create("", cluster.name),
                this.s3BucketApiFactory.create("", cluster.name)
            );
        } else if (clusterName === "Cluster B") {
            const cluster = clusters.find(c => c.name === "Cluster B");
            if (!cluster) {
                throw new Error("Cluster not found");
            }
            return new ClusterSummarizer(
                { name: cluster.name, hebrewName: cluster.hebrewName },
                clusterBIndices.map(index => ({ name: index.name, hebrewName: index.hebrewName })),
                this.elasticsearchClusterApiFactory.create("", cluster.name),
                this.s3BucketApiFactory.create("", cluster.name)
            );
        } else {
            throw new Error(`Unknown cluster name: ${clusterName}`);
        }
    }
}
