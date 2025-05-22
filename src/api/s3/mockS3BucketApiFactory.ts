import { clusterA } from "../exampleData";
import { S3BucketApi } from "./s3BucketApi";
import { S3BucketApiFactory } from "./s3BucketApiFactory";

export class MockS3BucketApiFactory implements S3BucketApiFactory {
    create(env: string, bucketName: string): S3BucketApi {
        if (bucketName === "Bucket A") {
            return {
                getStorage: () =>
                    Promise.resolve({
                        totalS3Storage: clusterA.totalS3Storage,
                        usedS3Storage: clusterA.usedS3Storage
                    })
            } as S3BucketApi;
        } else {
            throw new Error(`Bucket ${bucketName} not found`);
        }
    };
};
