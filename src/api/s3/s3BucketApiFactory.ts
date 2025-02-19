import { S3BucketApi } from "./s3BucketApi";

export interface S3BucketApiFactory {
    create: (env: string, bucketName: string) => S3BucketApi;
};
