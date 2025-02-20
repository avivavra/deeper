"use client";

import { config } from '../../config/config';
import { default as StorageDashboardPageComponent } from '../pages/storage-dashboard/StorageDashboardPage';
import { clustersMetadata } from '@/config/config-calc';
import { Audience } from '../pages/storage-dashboard/models';
import { ExampleDataClusterSummarizerFactory } from '@/api/summary/exampleDataClusterSummarizerFactory';
import { MockElasticsearchClusterApiFactory } from '@/api/elasticsearch/mockElasticsearchClusterApiFactory';
import { MockS3BucketApiFactory } from '@/api/s3/mockS3BucketApiFactory';

const elasticsearchClusterApiFactory = new MockElasticsearchClusterApiFactory();
const s3BucketApiFactory = new MockS3BucketApiFactory();
const clustersSummarizerFactory = new ExampleDataClusterSummarizerFactory(elasticsearchClusterApiFactory, s3BucketApiFactory);

const StorageDashboardPage = () => {
  return (
    <StorageDashboardPageComponent
      clustersSummarizerFactory={clustersSummarizerFactory}
      clustersMetadata={clustersMetadata}
      defaultMode={config.defaultMode as Audience}
      combineForUser={config.combineForUser}
    />
  );
};

export default StorageDashboardPage;