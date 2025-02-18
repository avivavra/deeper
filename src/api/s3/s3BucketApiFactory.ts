import { S3BucketApi } from "./S3BucketApi";

export interface S3BucketApiFactory {
    create: (env: string, bucketName: string) => S3BucketApi;
};
