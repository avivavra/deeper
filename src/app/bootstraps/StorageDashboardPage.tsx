"use client";

import { StorageDashboardPage as StorageDashboardPageComponent } from '../pages/storage-dashboard';
import { config, clustersMetadata } from '../../config';
import { Audience } from '../pages/storage-dashboard/models';
import { MockS3BucketApiFactory, ConfigElasticsearchClusterApiFactory, ConfigClusterSummarizerFactory, ExampleDataClusterSummarizerFactory } from '../../api';
import { MockAuthorizationService } from '../../api/authorization';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthorizationWrapper } from '../authorization';

const elasticsearchClusterApiFactory = new ConfigElasticsearchClusterApiFactory();
const s3BucketApiFactory = new MockS3BucketApiFactory(); // TODO: implement
const clustersSummarizerFactory = new ConfigClusterSummarizerFactory(elasticsearchClusterApiFactory, s3BucketApiFactory);
const authorizationService = new MockAuthorizationService();

export const StorageDashboardPage = () => {
  const { clustersConnection, defaultMode } = config;

  const getThresholdMode = (clusterName: string) => Number(clustersConnection[clusterName]?.thresholdMode);

  return (
    <BrowserRouter>
      <AuthorizationWrapper authorizationService={authorizationService}>
        <StorageDashboardPageComponent
          clustersSummarizerFactory={clustersSummarizerFactory}
          clustersMetadata={clustersMetadata}
          defaultMode={defaultMode as Audience}
          getThresholdMode={getThresholdMode}
        />
      </AuthorizationWrapper>
    </BrowserRouter>
  );
};
