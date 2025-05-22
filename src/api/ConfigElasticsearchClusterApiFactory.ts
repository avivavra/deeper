import { AxiosElasticsearchClusterApi } from './elasticsearch/axiosElasticsearchClusterApi';

export class ConfigElasticsearchClusterApiFactory {
    private sourceFieldName: string;

    constructor(sourceFieldName: string) {
        this.sourceFieldName = sourceFieldName;
    }

    create(url: string, username: string, password: string) {
        return new AxiosElasticsearchClusterApi(url, username, password, this.sourceFieldName);
    }
}