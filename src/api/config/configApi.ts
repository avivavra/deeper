type IndexTemplateConfig = {
    name: string;
    hebrewName: string;
    frequency: "daily" | "monthly" | "yearly";
    canAddSources?: boolean;
    showToUsers?: boolean;
};

export type ClusterConfig = {
    name: string;
    hebrewName: string;
    url: string;
    bucketName?: string;
    username: string;
    password: string;
    indexTemplatesConfig: IndexTemplateConfig[];
    thresholdMode?: number;
};

export type ClustersConfig = {
    [clusterName: string]: ClusterConfig;
};

export interface ConfigApi {
    getClustersConfig: () => Promise<ClustersConfig>;
}
