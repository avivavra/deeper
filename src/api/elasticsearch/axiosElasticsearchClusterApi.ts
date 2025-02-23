import { convertBytesToGB } from '@/app/utils';
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
                cold?: { min_age: string },
                warm?: { min_age: string },
                frozen?: { min_age: string },
                delete?: { min_age: string }
            }
        }
    }
};

type IndexTemplatesResponse = {
    index_templates: {
        name: string;
        index_template: {
            index_patterns: string[];
            template?: {
                settings?: {
                    index?: {
                        lifecycle?: { name: string; }
                    }
                }
            }
        };
    }[];
};

type IndicesResponse = {
    index: string,
    "docs.count": string,
    "creation.date": number,
    "store.size": string
}[];

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
                totalStorage: convertBytesToGB(totalStorage),
                usedStorage: convertBytesToGB(totalStorage - freeStorage)
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get cluster storage: ${error.message}`);
            } else {
                throw new Error('Failed to get cluster storage: Unknown error');
            }
        }
    }

    async fetchIndexTemplates(): Promise<IndexTemplate[]> {
        try {
            const response = await this.axiosInstance.get<IndexTemplatesResponse>('/_index_template/*', {
                params: {
                    filter_path: 'index_templates.name,index_templates.index_template.index_patterns,index_templates.index_template.template.settings.index.lifecycle.name'
                }
            });

            return response.data.index_templates.map(template => ({
                name: template.name,
                patterns: template.index_template.index_patterns,
                ilmPolicy: template.index_template.template?.settings?.index?.lifecycle?.name
            }));
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch index templates: ${error.message}`);
            } else {
                throw new Error('Failed to fetch index templates: Unknown error');
            }
        }
    }

    async fetchIndices(): Promise<Index[]> {
        try {
            const response = await this.axiosInstance.get<IndicesResponse>('/_cat/indices/*', {
                params: {
                    v: true,
                    format: 'json',
                    s: 'index',
                    h: 'index,docs.count,creation.date,store.size',
                    bytes: 'b'
                }
            });

            return response.data.map(index => ({
                name: index.index,
                docsCount: Number(index['docs.count']),
                creationTime: new Date(Number(index['creation.date'])),
                storage: convertBytesToGB(Number(index['store.size']))
            }));
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch indices: ${error.message}`);
            } else {
                throw new Error('Failed to fetch indices: Unknown error');
            }
        }
    }

    /** @returns In milli-seconds */
    async fetchIlmPoliciesWithDeletePhase(): Promise<IlmPolicy[]> {
        try {
            const response = await this.axiosInstance.get<IlmPolicyResponse>('/_ilm/policy', {
                params: {
                    filter_path: '**.policy.phases'
                }
            });

            const policies: (IlmPolicy | null)[] = Object.entries(response.data).map(([name, policyData]) => {
                const phases = policyData.policy.phases;

                if (!phases.delete) return null;

                const warmMinAge = phases.warm ? this.parseDurationToEpochMillis(phases.warm.min_age) : null;
                const coldMinAge = phases.cold ? this.parseDurationToEpochMillis(phases.cold.min_age) : null;
                const frozenMinAge = phases.frozen ? this.parseDurationToEpochMillis(phases.frozen.min_age) : null;
                const deleteMinAge = this.parseDurationToEpochMillis(phases.delete.min_age);

                const hotTierRetentionPeriod = warmMinAge || coldMinAge || frozenMinAge || deleteMinAge;

                const warmTierRetentionPeriod = warmMinAge
                    ? coldMinAge || frozenMinAge || deleteMinAge
                    : 0;

                const coldTierRetentionPeriod = coldMinAge
                    ? frozenMinAge || deleteMinAge
                    : 0;

                const frozenTierRetentionPeriod = frozenMinAge
                    ? deleteMinAge
                    : 0;

                return {
                    name,
                    hotTierRetentionPeriod,
                    warmTierRetentionPeriod,
                    coldTierRetentionPeriod,
                    frozenTierRetentionPeriod
                };
            });

            return policies.filter(policy => policy !== null);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch ILM policies: ${error.message}`);
            } else {
                throw new Error('Failed to fetch ILM policies: Unknown error');
            }
        }
    }

    private parseDurationToEpochMillis(duration: string): number {
        const durationRegex = /(\d+)([mhd])/;
        const match = duration.match(durationRegex);

        if (!match) {
            throw new Error(`Invalid duration format: ${duration}`);
        }

        const value = parseInt(match[1], 10);
        const unit = match[2];

        switch (unit) {
            case 'm':
                return value * 60 * 1000;
            case 'h':
                return value * 3600 * 1000;
            case 'd':
                return value * 86400 * 1000;
            default:
                throw new Error(`Unknown duration unit: ${unit}`);
        }
    }
}
