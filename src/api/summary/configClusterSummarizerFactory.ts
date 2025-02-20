import { config } from "@/config/config";
import { ElasticsearchClusterApiFactory } from "../elasticsearch/elasticsearchClusterApiFactory";
import { clusterAIndices, clusterBIndices, clusters } from "../exampleData";
import { S3BucketApiFactory } from "../s3/s3BucketApiFactory";
import { ClusterSummarizer } from "./clusterSummarizer";
import { ClusterSummarizerFactory } from "./clusterSummarizerFactory";

export class ConfigClusterSummarizerFactory implements ClusterSummarizerFactory {
    constructor(
        private readonly elasticsearchClusterApiFactory: ElasticsearchClusterApiFactory,
        private readonly s3BucketApiFactory: S3BucketApiFactory
    ) { }

    createSummarizer(clusterName: string) {
        const clusterConfig = (config.clustersConnection as {
            [clusterName: string]: { name: string, hebrewName: string, indicesMetadata: { name: string, hebrewName: string }[] }
        })[clusterName];

        return new ClusterSummarizer(
            { name: clusterConfig.name, hebrewName: clusterConfig.hebrewName },
            clusterConfig.indicesMetadata,
            this.elasticsearchClusterApiFactory.create("", clusterName),
            this.s3BucketApiFactory.create("", clusterName)
        );
    }
}
