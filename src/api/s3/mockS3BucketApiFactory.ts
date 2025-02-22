import { S3ClusterStorage } from "@/app/pages/storage-dashboard/models/cluster-models";
import { clusters } from "../exampleData";
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
                    Promise.resolve([{
                        name: "test-template",
                        storage: 20
                    }, {
                        name: ".fleet-fileds-tohost-meta",
                        storage: 30
                    }, {
                        name: ".monitoring-ent-search-mb",
                        storage: 15
                    }, {
                        name: ".fleet-fileds-fromhost-data",
                        storage: 10
                    }])
            } as S3BucketApi;
        } else {
            throw new Error("Cluster not found");
        }
    };
};
