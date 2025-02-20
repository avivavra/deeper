import { ClusterData, ClusterMetadata, IndexData } from "@/app/pages/storage-dashboard/models";
import { ElasticsearchClusterApi } from "../elasticsearch/elasticsearchClusterApi";
import { S3BucketApi } from "../s3/s3BucketApi";

export class ClusterSummarizer {
    constructor(
        private readonly clusterMetadata: ClusterMetadata,
        private readonly indicesMetadata: { name: string, hebrewName: string }[],
        private readonly elasticsearchClusterApi: ElasticsearchClusterApi,
        private readonly s3BucketApi: S3BucketApi
    ) { }

    async summarize(): Promise<ClusterData> {
        const [elasticsearchStorage, s3Storage] = await Promise.all([
            this.elasticsearchClusterApi.getClusterStorage(),
            this.s3BucketApi.getStorage()
        ]);

        return {
            ...this.clusterMetadata,
            totalElasticStorage: elasticsearchStorage.totalStorage,
            usedElasticStorage: elasticsearchStorage.usedStorage,
            totalS3Storage: s3Storage.totalS3Storage,
            usedS3Storage: s3Storage.usedS3Storage
        };
    }

    async summarizeIndices(): Promise<IndexData[]> {
        const [elasticIndexTemplates, s3Folders] = await Promise.all([
            this.elasticsearchClusterApi.getIndexTemplates(),
            this.s3BucketApi.getFolders()
        ]);

        return this.indicesMetadata.map(indexMetadata => {
            const matchingIndexTemplate = elasticIndexTemplates.find(index => index.indexTemplate === indexMetadata.name);
            if (!matchingIndexTemplate) {
                throw new Error(`No index template found for ${indexMetadata.name}`);
            }

            const matchingFolder = s3Folders.find(folder => folder.name === indexMetadata.name);
            if (!matchingFolder) {
                throw new Error(`No S3 folder found for index template ${indexMetadata.name}`);
            }

            return {
                name: indexMetadata.name,
                hebrewName: indexMetadata.hebrewName,
                hotRetentionDays: matchingIndexTemplate.hotRetentionDays,
                coldRetentionDays: matchingIndexTemplate.coldRetentionDays,
                elasticStorageGB: matchingIndexTemplate.storage,
                elasticStoragePerColdTierDay: 1,
                elasticStoragePerHotTierDay: 1,
                S3StoragePerColdTierDay: 1,
                S3StorageGB: matchingFolder.storage,
                totalRetentionDays: matchingIndexTemplate.hotRetentionDays + matchingIndexTemplate.coldRetentionDays
            };
        });
    }
};
