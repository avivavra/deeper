"use client";

import { StorageDashboardPage as StorageDashboardPageComponent } from '../pages/storage-dashboard';
import { Audience } from '../pages/storage-dashboard/models';
import { MockS3BucketApiFactory, ConfigElasticsearchClusterApiFactory, ConfigClusterSummarizerFactory, ExampleDataClusterSummarizerFactory, MockAuthorizationService, SourcesTranslator } from '../../api';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthorizationWrapper } from '../authorization';
import { config as staticConfig } from '../../config';
import { MockConfigApi } from '../../api/config/mockConfigApi';
import { StorageDashboardConfigGuard } from '../pages/storage-dashboard/StorageDashboardConfigGuard';

const s3BucketApiFactory = new MockS3BucketApiFactory();
const authorizationService = new MockAuthorizationService();
const sourcesTranslator = new SourcesTranslator(staticConfig.sourcesTranslatorUrl);
const configApi = new MockConfigApi();

export const StorageDashboardPage = () => {
  return (
    <BrowserRouter>
      <AuthorizationWrapper authorizationService={authorizationService}>
        <StorageDashboardConfigGuard configApi={configApi}>
          {(clustersConfig) => {
            const elasticsearchClusterApiFactory = new ConfigElasticsearchClusterApiFactory(clustersConfig);
            const clustersSummarizerFactory = new ConfigClusterSummarizerFactory(elasticsearchClusterApiFactory, s3BucketApiFactory, clustersConfig);

            return (
              <StorageDashboardPageComponent
                clustersSummarizerFactory={clustersSummarizerFactory}
                clustersMetadata={Object.values(clustersConfig)}
                defaultMode={staticConfig.defaultMode as Audience}
                getThresholdMode={(clusterName: string) => Number(clustersConfig[clusterName]?.thresholdMode)}
                mailAddressees={staticConfig.mailAddressees}
                sourcesTranslator={sourcesTranslator}
              />
            );
          }}
        </StorageDashboardConfigGuard>
      </AuthorizationWrapper>
    </BrowserRouter>
  );
};
