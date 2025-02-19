import { ElasticsearchClusterApi } from "./elasticsearchClusterApi";

export interface ElasticsearchClusterApiFactory {
    create: (env: string, clusterName: string) => ElasticsearchClusterApi;
}