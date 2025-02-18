import { S3ClusterStorage } from "@/app/pages/storage-dashboard/models";

export interface S3BucketApi {
    getStorage: (name: string) => Promise<S3ClusterStorage>;
    getFolderStorage: (folder: string) => Promise<number>;
}