import { S3ClusterStorage } from "@/app/pages/storage-dashboard/models";
import { clusters, clusterAIndices, clusterBIndices } from "../exampleData";
import { S3BucketApi } from "./s3BucketApi";
import { S3BucketApiFactory } from "./s3BucketApiFactory";

export class MockS3BucketApiFactory implements S3BucketApiFactory {
    create(env: string, bucketName: string): S3BucketApi {
        if (bucketName === "Cluster A") {
            return {
                getStorage: () =>
                    Promise.resolve({
                        totalS3Storage: (clusters.find(c => c.name === "Cluster A") as S3ClusterStorage).totalS3Storage,
                        usedS3Storage: (clusters.find(c => c.name === "Cluster A") as S3ClusterStorage).usedS3Storage
                    }),
                getFolders: () =>
                    Promise.resolve(clusterAIndices.map(index => ({
                        name: index.name,
                        storage: index.S3StorageGB
                    })))
            } as S3BucketApi;
        } else if (bucketName === "Cluster B") {
            return {
                getStorage: () =>
                    Promise.resolve({
                        totalS3Storage: (clusters.find(c => c.name === "Cluster B") as S3ClusterStorage).totalS3Storage,
                        usedS3Storage: (clusters.find(c => c.name === "Cluster B") as S3ClusterStorage).usedS3Storage
                    }),
                getFolders: () =>
                    Promise.resolve(clusterBIndices.map(index => ({
                        name: index.name,
                        storage: index.S3StorageGB
                    })))
            } as S3BucketApi;
        } else {
            throw new Error("Cluster not found");
        }
    };
};
