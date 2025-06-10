import { config } from "../../config";
import { ElasticsearchClusterApi } from "./elasticsearchClusterApi";
import { ElasticsearchClusterApiFactory } from "./elasticsearchClusterApiFactory";
import { AxiosElasticsearchClusterApi } from "./axiosElasticsearchClusterApi";

export class ConfigElasticsearchClusterApiFactory implements ElasticsearchClusterApiFactory {
    constructor(
        private readonly clustersConfig: { [clusterName: string]: { url: string, username: string, password: string } }
    ) {}

    create(env: string, clusterName: string): ElasticsearchClusterApi {
        const clusterConfig = this.clustersConfig[clusterName];
        if (!clusterConfig) {
            throw new Error(`Cluster not found: ${clusterName}`);
        }

        return new AxiosElasticsearchClusterApi(clusterName, clusterConfig.url, clusterConfig.username, clusterConfig.password, config.sourceFieldName);
    }
}
