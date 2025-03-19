"use client";

import { StorageDashboardPage as StorageDashboardPageComponent } from '../pages/storage-dashboard';
import { config, clustersMetadata } from '../../config';
import { Audience } from '../pages/storage-dashboard/models';
import { MockS3BucketApiFactory, ConfigElasticsearchClusterApiFactory, ConfigClusterSummarizerFactory, ExampleDataClusterSummarizerFactory } from '../../api';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

const elasticsearchClusterApiFactory = new ConfigElasticsearchClusterApiFactory();
const s3BucketApiFactory = new MockS3BucketApiFactory(); // TODO: implement
const clustersSummarizerFactory = new ConfigClusterSummarizerFactory(elasticsearchClusterApiFactory, s3BucketApiFactory);
// const clustersSummarizerFactory = new ExampleDataClusterSummarizerFactory();

export const StorageDashboardPage = () => {
  return (
    <BrowserRouter>
      <StorageDashboardPageComponent
        clustersSummarizerFactory={clustersSummarizerFactory}
        clustersMetadata={clustersMetadata}
        defaultMode={config.defaultMode as Audience}
      />
    </BrowserRouter>
  );
};
