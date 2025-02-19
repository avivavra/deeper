import { convertToGB } from '@/logic/converts';
import axios, { AxiosInstance } from 'axios';
import { ElasticsearchClusterApi } from './elasticsearchClusterApi';

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
        const response = await this.axiosInstance.get<{ indices: { [index: string]: { total: { store: { size_in_bytes: number } } } } }>('/_stats/store', {
            params: {
                level: 'indices',
                filter_path: '**.store.size_in_bytes',
                index: indices.join(','),
            }
        });

        const indexStats = response.data.indices;
        const indexStatsMap = new Map<string, number>();

        for (const index in indexStats) {
            if (indexStats.hasOwnProperty(index)) {
                indexStatsMap.set(index, indexStats[index].total.store.size_in_bytes);
            }
        }

        return indexStatsMap;
    }

    private constructTemplates(policies: IlmPolicyResponse, indexStatsMap: Map<string, number>): { indexTemplate: string; hotRetentionDays: number; coldRetentionDays: number; storage: number; }[] {
        const templates: { indexTemplate: string; hotRetentionDays: number; coldRetentionDays: number; storage: number; }[] = [];

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

    private parseDurationToDays(duration: string): number {
        const durationRegex = /(\d+)([mhd])/;
        const match = duration.match(durationRegex);

        if (!match) {
            throw new Error(`Invalid duration format: ${duration}`);
        }

        const value = parseInt(match[1], 10);
        const unit = match[2];

        let days;
        switch (unit) {
            case 'm':
                days = value / 1440;
            case 'h':
                days = value / 24;
            case 'd':
                days = value;
            default:
                throw new Error(`Unknown duration unit: ${unit}`);
        }

        return Math.round(days);
    }
}
