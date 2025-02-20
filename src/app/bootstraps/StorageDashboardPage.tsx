"use client";

import { config } from '../../config/config';
import { default as StorageDashboardPageComponent } from '../pages/storage-dashboard/StorageDashboardPage';
import { clustersMetadata } from '@/config/config-calc';
import { Audience } from '../pages/storage-dashboard/models';
import { ConfigElasticsearchClusterApiFactory } from '@/api/elasticsearch/configElasticsearchClusterApiFactory';
import { ConfigClusterSummarizerFactory } from '@/api/summary/configClusterSummarizerFactory';
import { MockS3BucketApiFactory } from '@/api/s3/mockS3BucketApiFactory';

const elasticsearchClusterApiFactory = new ConfigElasticsearchClusterApiFactory();
const s3BucketApiFactory = new MockS3BucketApiFactory();
const clustersSummarizerFactory = new ConfigClusterSummarizerFactory(elasticsearchClusterApiFactory, s3BucketApiFactory);

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