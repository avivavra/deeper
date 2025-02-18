"use client";

import { MockClustersApi } from '@/api/clusters/mockClustersApi';
import { config } from '../../config/config';
import { default as StorageDashboardPageComponent } from '../pages/storage-dashboard/StorageDashboardPage';
import { DelayMockClustersApi } from '@/api/clusters/delayMockClustersApi';
import { clustersMetadata } from '@/config/config-calc';
import { Audience } from '../pages/storage-dashboard/models';

const clustersApi = new DelayMockClustersApi(new MockClustersApi());

const StorageDashboardPage = () => {
  return (
    <StorageDashboardPageComponent
      clustersApi={clustersApi}
      clustersMetadata={clustersMetadata}
      defaultMode={config.defaultMode as Audience}
      combineForUser={config.combineForUser}
    />
  );
};

export default StorageDashboardPage;