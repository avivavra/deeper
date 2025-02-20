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
                    Promise.resolve([{
                        name: ".fleet-fileds-tohost-meta",
                        storage: 30
                    }, {
                        name: ".monitoring-ent-search-mb",
                        storage: 15
                    }, {
                        name: "synthetics-browser.screenshot",
                        storage: 10
                    }, {
                        name: "metrics-apm.app@template",
                        storage: 12
                    }])
            } as S3BucketApi;
        } else {
            throw new Error("Cluster not found");
        }
    };
};
