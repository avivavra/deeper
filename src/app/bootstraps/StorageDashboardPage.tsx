"use client";

import { MockClustersApi } from '@/api/clusters/mockClustersApi';
import { config } from '../../config';
import { default as StorageDashboardPageComponent } from '../pages/storage-dashboard/StorageDashboardPage';
import { DelayMockClustersApi } from '@/api/clusters/delayMockClustersApi';

const clustersApi = new DelayMockClustersApi();

const StorageDashboardPage = () => {
  return (
    <StorageDashboardPageComponent
      clustersApi={clustersApi}
    />
  );
};

export default StorageDashboardPage;