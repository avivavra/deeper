import { ElasticsearchClusterApi } from "./ElasticsearchClusterApi";

export interface ElasticsearchClusterApiFactory {
    create: (env: string, clusterName: string) => ElasticsearchClusterApi;
}