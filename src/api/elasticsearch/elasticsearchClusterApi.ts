import { ElasticClusterStorage, ElasticIndexData } from "@/app/pages/storage-dashboard/models";

export interface ElasticsearchClusterApi {
    getStorage: (name: string) => Promise<ElasticClusterStorage>;
    getIndicesOfPattern: (pattern: string) => Promise<ElasticIndexData[]>;
}