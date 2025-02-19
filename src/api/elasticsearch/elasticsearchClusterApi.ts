import { ElasticClusterStorage, ElasticIndexTemplate } from "@/app/pages/storage-dashboard/models";

export interface ElasticsearchClusterApi {
    getStorage: (name: string) => Promise<ElasticClusterStorage>;
    getIndexTemplate: (name: string) => Promise<ElasticIndexTemplate[]>;
}
