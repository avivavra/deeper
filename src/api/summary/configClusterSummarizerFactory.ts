import { config } from "@/config";
import { ElasticsearchClusterApiFactory } from "../elasticsearch/elasticsearchClusterApiFactory";
import { S3BucketApiFactory } from "../s3";
import { ClusterSummarizer, IndexTemplateConfig } from "./clusterSummarizer";
import { ClusterSummarizerFactory } from "./clusterSummarizerFactory";

export class ConfigClusterSummarizerFactory implements ClusterSummarizerFactory {
    constructor(
        private readonly elasticsearchClusterApiFactory: ElasticsearchClusterApiFactory,
        private readonly s3BucketApiFactory: S3BucketApiFactory
    ) { }

    createSummarizer(clusterName: string) {
        const clusterConfig = (config.clustersConnection as {
            [clusterName: string]: {
                name: string,
                hebrewName: string,
                indexTemplatesConfig: IndexTemplateConfig[]
            }
        })[clusterName];

        return new ClusterSummarizer(
            { name: clusterConfig.name, hebrewName: clusterConfig.hebrewName },
            clusterConfig.indexTemplatesConfig,
            this.elasticsearchClusterApiFactory.create("", clusterName), // TODO: handle two envs
            this.s3BucketApiFactory.create("", clusterName)
        );
    }
}
