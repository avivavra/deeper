import { clusters, clusterAIndices, clusterBIndices } from "../exampleData";
import { ElasticsearchClusterApi } from "./elasticsearchClusterApi";
import { ElasticsearchClusterApiFactory } from "./elasticsearchClusterApiFactory";

export class MockElasticsearchClusterApiFactory implements ElasticsearchClusterApiFactory {
    create(env: string, clusterName: string): ElasticsearchClusterApi {
        if (clusterName === "Cluster A") {
            return {
                getClusterStorage: () =>
                    Promise.resolve({
                        totalStorage: clusters.find(c => c.name === "Cluster A")!.totalElasticStorage,
                        usedStorage: clusters.find(c => c.name === "Cluster A")!.usedElasticStorage
                    }),
                getIndexTemplates: () =>
                    Promise.resolve(clusterAIndices.map(index => ({
                        indexTemplate: index.name,
                        hotRetentionDays: index.hotRetentionDays,
                        coldRetentionDays: index.coldRetentionDays,
                        storage: index.elasticStorageGB
                    })))
            } as ElasticsearchClusterApi;
        } else if (clusterName === "Cluster B") {
            return {
                getClusterStorage: () =>
                    Promise.resolve({
                        totalStorage: clusters.find(c => c.name === "Cluster B")!.totalElasticStorage,
                        usedStorage: clusters.find(c => c.name === "Cluster B")!.usedElasticStorage
                    }),
                getIndexTemplates: () =>
                    Promise.resolve(clusterBIndices.map(index => ({
                        indexTemplate: index.name,
                        hotRetentionDays: index.hotRetentionDays,
                        coldRetentionDays: index.coldRetentionDays,
                        storage: index.elasticStorageGB
                    })))
            } as ElasticsearchClusterApi;
        } else {
            throw new Error("Cluster not found");
        }
    }
}
