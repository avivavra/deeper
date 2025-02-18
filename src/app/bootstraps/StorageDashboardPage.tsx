"use client";

import { MockClusterSummarizerFactory } from '@/api/summary/mockClusterSummarizerFactory';
import { config } from '../../config/config';
import { default as StorageDashboardPageComponent } from '../pages/storage-dashboard/StorageDashboardPage';
import { clustersMetadata } from '@/config/config-calc';
import { Audience } from '../pages/storage-dashboard/models';

const clustersSummarizerFactory = new MockClusterSummarizerFactory();

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