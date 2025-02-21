import { convertToGB } from '@/logic/converts';
import axios, { AxiosInstance } from 'axios';
import { ElasticsearchClusterApi, IndexTemplateData } from './elasticsearchClusterApi';

type ClusterStats = {
    nodes: {
        fs: {
            total_in_bytes: number;
            free_in_bytes: number; // total amount of free disk space on the fs. includes space that is reserved for system use.
            available_in_bytes: number; // amount of disk space that is actually available for use. excludes space that is reserved by the OS.
        }
    }
}

type IlmPolicyResponse = {
    [ilm: string]: {
        policy: {
            phases: {
                // hot: { min_age: string },
                cold: { min_age: string },
                warm: { min_age: string },
                delete: { min_age: string }
            }
        },
        in_use_by: {
            composable_templates: string[];
            indices: string[];
        }
    }
};

interface IndexStorageStats {
    hotTierBytes: number;
    warmTierBytes: number;
    coldTierBytes: number;
    frozenTierBytes: number;
}

interface NodeStats {
    name: string;
    roles: string[];
}

interface ShardAllocation {
    index: string;
    shard: string;
    node: string;
    store: string;
}

export class AxiosElasticsearchClusterApi implements ElasticsearchClusterApi {
    private axiosInstance: AxiosInstance;

    constructor(url: string, username: string, password: string) {
        this.axiosInstance = axios.create({
            baseURL: url,
            auth: {
                username,
                password
            }
        });
    }

    public async getClusterStorage(): Promise<{ totalStorage: number; usedStorage: number }> {
        try {
            const response = await this.axiosInstance.get<ClusterStats>('/_cluster/stats', {
                params: {
                    filter_path: 'nodes.fs'
                }
            });

            const {
                total_in_bytes: totalStorage,
                free_in_bytes: freeStorage,
                available_in_bytes: availableStorage
            } = response.data.nodes.fs;

            // const storageReservedForSystem = freeStorage - availableStorage;
            // const storageForData = totalStorage - storageReservedForSystem;

            return { totalStorage: convertToGB(totalStorage), usedStorage: convertToGB(totalStorage - freeStorage) };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get cluster storage: ${error.message}`);
            } else {
                throw new Error('Failed to get cluster storage: Unknown error');
            }
        }
    }

    public async getIndexTemplates(): Promise<IndexTemplateData[]> {
        try {
            const policies = await this.fetchIlmPolicies();
            const allIndices = this.extractAllIndices(policies);
            const indicesStorage = await this.getIndicesStorageStats(allIndices);

            return this.constructTemplates(policies, indicesStorage);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get index templates: ${error.message}`);
            } else {
                throw new Error('Failed to get index templates: Unknown error');
            }
        }
    }

    private async fetchIlmPolicies(): Promise<IlmPolicyResponse> {
        const response = await this.axiosInstance.get<IlmPolicyResponse>('/_ilm/policy', {
            params: {
                filter_path: '**.in_use_by,**.policy.phases'
            }
        });

        return response.data;
    }

    private extractAllIndices(policies: IlmPolicyResponse): string[] {
        return Object.values(policies).flatMap(policy => policy.in_use_by.indices);
    }

    private constructTemplates(policies: IlmPolicyResponse, indexStatsMap: Record<string, IndexStorageStats>): IndexTemplateData[] {
        const templates: IndexTemplateData[] = [];

        for (const policyName in policies) {
            if (policies.hasOwnProperty(policyName)) {
                const policy = policies[policyName];
                const inUseBy = policy.in_use_by;
                const phases = policy.policy.phases;

                if (!phases.delete) continue;
                
                let hotRetentionDays = 0;
                let coldRetentionDays = 0;

                if (phases.cold && phases.cold.min_age) {
                    hotRetentionDays = this.parseDurationToDays(phases.cold.min_age);
                    coldRetentionDays = this.parseDurationToDays(phases.delete.min_age);
                } else {
                    hotRetentionDays = this.parseDurationToDays(phases.delete.min_age);
                }

                for (const indexTemplate of inUseBy.composable_templates) {
                    let hotTierStorage = 0;
                    let coldTierStorage = 0;

                    for (const index of inUseBy.indices) {
                        const indexStorage = indexStatsMap[index];
                        if (!indexStorage) {
                            throw new Error(`Index ${index} is missing storage information`);
                        }
                        hotTierStorage += indexStorage.hotTierBytes + indexStorage.warmTierBytes;
                        coldTierStorage += indexStorage.coldTierBytes + indexStorage.frozenTierBytes;
                    }

                    templates.push({
                        indexTemplate,
                        hotRetentionDays,
                        coldRetentionDays,
                        hotTierStorage: convertToGB(hotTierStorage),
                        coldTierStorage: convertToGB(coldTierStorage)
                    });
                }
            }
        }

        return templates;
    }

    private parseDurationToDays(duration: string): number {
        const durationRegex = /(\d+)([mhd])/;
        const match = duration.match(durationRegex);

        if (!match) {
            throw new Error(`Invalid duration format: ${duration}`);
        }

        const value = parseInt(match[1], 10);
        const unit = match[2];

        switch (unit) {
            case 'm':
                return value / 1440;
            case 'h':
                return value / 24;
            case 'd':
                return value;
            default:
                throw new Error(`Unknown duration unit: ${unit}`);
        }
    }

    async getIndicesStorageStats(indexNames: string[]): Promise<Record<string, IndexStorageStats>> {
        try {
            const nodeTiers = await this.getNodeTiers();
            const allShards = await this.getShardAllocation(indexNames);
            const shardsByIndex = this.groupShardsByIndex(allShards);

            return indexNames.reduce((acc: Record<string, IndexStorageStats>, indexName) => {
                const indexShards = shardsByIndex[indexName] || [];
                const tiersStorage = this.calculateTiersStorage(indexShards, nodeTiers);

                acc[indexName] = {
                    hotTierBytes: tiersStorage.hot || 0,
                    warmTierBytes: tiersStorage.warm || 0,
                    coldTierBytes: tiersStorage.cold || 0,
                    frozenTierBytes: tiersStorage.frozen || 0
                };

                return acc;
            }, {});
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Elasticsearch request failed: ${error.message}`);
            }
            throw error;
        }
    }

    private async getNodeTiers(): Promise<Record<string, string>> {
        const nodesResponse = await this.axiosInstance.get<{ nodes: Record<string, NodeStats> }>('/_nodes/_all/stats');
        const nodes = nodesResponse.data.nodes;
        const tierPriority = ['data_hot', 'data_warm', 'data_cold', 'data_frozen'];

        return Object.entries(nodes).reduce((acc: Record<string, string>, [nodeId, node]: [string, NodeStats]) => {
            const nodeName = node.name;
            const roles: string[] = node.roles;
            const highestTierRole = tierPriority.find(tier => roles.includes(tier));
            if (highestTierRole) {
                acc[nodeName] = highestTierRole.replace('data_', '');
            }
            return acc;
        }, {});
    }

    private async getShardAllocation(indexNames: string[]): Promise<ShardAllocation[]> {
        const indices = indexNames.join(',');
        const response = await this.axiosInstance.get<ShardAllocation[]>('/_cat/shards', {
            params: {
                format: 'json',
                bytes: 'b',
                h: 'index,shard,node,store',
                index: indices
            }
        });
        return response.data;
    }

    private groupShardsByIndex(shards: ShardAllocation[]): Record<string, ShardAllocation[]> {
        return shards.reduce((acc: Record<string, ShardAllocation[]>, shard: ShardAllocation) => {
            if (!shard.node) {
                return acc;
            }
            if (!acc[shard.index]) {
                acc[shard.index] = [];
            }
            acc[shard.index].push(shard);
            return acc;
        }, {});
    }

    private calculateTiersStorage(shards: ShardAllocation[], nodeTiers: Record<string, string>): Record<string, number> {
        return shards.reduce((acc: Record<string, number>, shard: ShardAllocation) => {
            if (!shard.store || !shard.node || !nodeTiers[shard.node]) {
                return acc;
            }
            const tier = nodeTiers[shard.node];
            acc[tier] = (acc[tier] || 0) + parseInt(shard.store, 10);
            return acc;
        }, {});
    }
}
