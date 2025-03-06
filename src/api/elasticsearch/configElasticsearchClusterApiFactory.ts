import { config } from "../../config/config";
import { ElasticsearchClusterApi } from "./elasticsearchClusterApi";
import { ElasticsearchClusterApiFactory } from "./elasticsearchClusterApiFactory";
import { AxiosElasticsearchClusterApi } from "./axiosElasticsearchClusterApi";

export class ConfigElasticsearchClusterApiFactory implements ElasticsearchClusterApiFactory {
    create(env: string, clusterName: string): ElasticsearchClusterApi {
        const clusterConfig = (config.clustersConnection as {
            [clusterName: string]: { url: string, username: string, password: string }
        })[clusterName];
        if (!clusterConfig) {
            throw new Error(`Cluster not found: ${clusterName}`);
        }

        return new AxiosElasticsearchClusterApi(clusterConfig.url, clusterConfig.username, clusterConfig.password);
    }
}
