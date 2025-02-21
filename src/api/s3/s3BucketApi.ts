import { S3ClusterStorage } from "@/app/pages/storage-dashboard/models/cluster-models";

export interface S3BucketApi {
    getStorage: () => Promise<S3ClusterStorage>;
    getFolders: () => Promise<{ name: string, storage: number }[]>;
}