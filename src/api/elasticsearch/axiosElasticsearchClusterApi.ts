import { convertToGB } from '@/logic/converts';
import axios, { AxiosInstance } from 'axios';
import { ElasticsearchClusterApi, IlmPolicy, Index, IndexTemplate } from './elasticsearchClusterApi';

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

    public async fetchClusterStorage(): Promise<{ totalStorage: number; usedStorage: number }> {
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

            return {
                totalStorage: convertToGB(totalStorage),
                usedStorage: convertToGB(totalStorage - freeStorage)
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get cluster storage: ${error.message}`);
            } else {
                throw new Error('Failed to get cluster storage: Unknown error');
            }
        }
    }
    
    fetchIndexTemplates(): Promise<IndexTemplate[]> {
        throw new Error('Not implemented');
    }

    fetchIndices(): Promise<Index[]> {
        throw new Error('Not implemented');
    }

    async fetchIlmPolicies(): Promise<IlmPolicy[]> {
        const response = await this.axiosInstance.get<IlmPolicyResponse>('/_ilm/policy', {
            params: {
                filter_path: '**.in_use_by,**.policy.phases'
            }
        });

        throw new Error('Not implemented');
        // return response.data;
    }
}
