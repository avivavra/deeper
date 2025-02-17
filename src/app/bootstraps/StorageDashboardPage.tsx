"use client";

import { MockClustersApi } from '@/api/clusters/mockClustersApi';
import { config } from '../../config/config';
import { default as StorageDashboardPageComponent } from '../pages/storage-dashboard/StorageDashboardPage';
import { DelayMockClustersApi } from '@/api/clusters/delayMockClustersApi';
import { clusterNames } from '@/config/config-calc';

const clustersApi = new DelayMockClustersApi(new MockClustersApi());

const StorageDashboardPage = () => {
  return (
    <StorageDashboardPageComponent
      clustersApi={clustersApi}
      clusterNames={clusterNames}
    />
  );
};

export default StorageDashboardPage;