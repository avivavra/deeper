import { convertToGB } from '@/logic/converts';
import axios, { AxiosInstance } from 'axios';

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
                hot: { min_age: string },
                cold: { min_age: string },
                warm: { min_age: string },
                delete: { min_age: string }
            }
        },
        in_use_by: {
            composable_template: string[];
            indices: string[];
        }
    }
};

export class AxiosElasticsearchClusterApi {
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

    public async getIndexTemplates(): Promise<{ indexTemplate: string; hotRetentionDays: number; coldRetentionDays: number; storage: number; }[]> {
        try {
            const policies = await this.fetchIlmPolicies();
            const allIndices = this.extractAllIndices(policies);
            const indicesStorage = await this.fetchIndicesStorage(allIndices);

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

    private async fetchIndicesStorage(indices: string[]): Promise<Map<string, number>> {
        const response = await this.axiosInstance.get<{ index: string; store: { size_in_bytes: number } }[]>('/_cat/indices', {
            params: {
                format: 'json',
                h: 'index,store.size_in_bytes',
                index: indices.join(',')
            }
        });

        return new Map(response.data.map(stat => [stat.index, stat.store.size_in_bytes]));
    }

    private constructTemplates(policies: IlmPolicyResponse, indexStatsMap: Map<string, number>): { indexTemplate: string; hotRetentionDays: number; coldRetentionDays: number; storage: number; }[] {
        const templates: { indexTemplate: string; hotRetentionDays: number; coldRetentionDays: number; storage: number; }[] = [];

        for (const policyName in policies) {
            if (policies.hasOwnProperty(policyName)) {
                const policy = policies[policyName];
                const inUseBy = policy.in_use_by;
                const phases = policy.policy.phases;

                let hotRetentionDays = 0;
                let coldRetentionDays = 0;

                if (phases.hot && phases.hot.min_age) {
                    hotRetentionDays = parseInt(phases.hot.min_age, 10);
                }

                if (phases.cold && phases.cold.min_age) {
                    coldRetentionDays = parseInt(phases.cold.min_age, 10);
                }

                for (const indexTemplate of inUseBy.composable_template) {
                    let totalStorage = 0;

                    for (const index of inUseBy.indices) {
                        const indexStorage = indexStatsMap.get(index);
                        if (!indexStorage) {
                            throw new Error(`Index ${index} is missing storage information`);
                        }
                        totalStorage += indexStorage;
                    }

                    templates.push({
                        indexTemplate,
                        hotRetentionDays,
                        coldRetentionDays,
                        storage: convertToGB(totalStorage)
                    });
                }
            }
        }

        return templates;
    }
}