"use client";

import { StorageDashboardPage as StorageDashboardPageComponent } from '../pages/storage-dashboard';
import { config, clustersMetadata } from '../../config';
import { Audience } from '../pages/storage-dashboard/models';
import { MockS3BucketApiFactory, ConfigElasticsearchClusterApiFactory, ConfigClusterSummarizerFactory, ExampleDataClusterSummarizerFactory, MockAuthorizationService, SourcesTranslator } from '../../api';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthorizationWrapper } from '../authorization';

const elasticsearchClusterApiFactory = new ConfigElasticsearchClusterApiFactory();
const s3BucketApiFactory = new MockS3BucketApiFactory();
const clustersSummarizerFactory = new ConfigClusterSummarizerFactory(elasticsearchClusterApiFactory, s3BucketApiFactory);
const authorizationService = new MockAuthorizationService();
const sourcesTranslator = new SourcesTranslator(config.sourcesTranslatorUrl);

export const StorageDashboardPage = () => {
  const { clustersConnection, defaultMode, mailAddressees } = config;

  const getThresholdMode = (clusterName: string) => Number(clustersConnection[clusterName]?.thresholdMode);

  return (
    <BrowserRouter>
      <AuthorizationWrapper authorizationService={authorizationService}>
        <StorageDashboardPageComponent
          clustersSummarizerFactory={clustersSummarizerFactory}
          clustersMetadata={clustersMetadata}
          defaultMode={defaultMode as Audience}
          getThresholdMode={getThresholdMode}
          mailAddressees={mailAddressees}
          sourcesTranslator={sourcesTranslator}
        />
      </AuthorizationWrapper>
    </BrowserRouter>
  );
};
