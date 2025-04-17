import { ClusterData, ClusterMetadata, SourceGroup } from "../app/pages/storage-dashboard/models";

export const clustersMetadata: ClusterMetadata[] = [
  {
    name: 'Cluster A',
    hebrewName: 'אשכול א'
  },
  {
    name: 'Cluster B',
    hebrewName: 'אשכול ב'
  }
];

export const clusterA: ClusterData = {
  name: 'Cluster A',
  hebrewName: 'אשכול א',
  totalElasticStorage: 500,
  usedElasticStorage: 300,
  totalS3Storage: 1000,
  usedS3Storage: 700
};

export const clusterB: ClusterData = {
  name: 'Cluster B',
  hebrewName: 'אשכול ב',
  totalElasticStorage: 300,
  usedElasticStorage: 214.7,
  totalS3Storage: 900,
  usedS3Storage: 627.5
};

export const clusterAIndices: SourceGroup[] = [
  {
    name: 'logs-production',
    hebrewName: 'לוגים-ייצור',
    elasticStoragePerHotTierDay: 4,
    S3StoragePerColdTierDay: 3,
    elasticStoragePerColdTierDay: 0.2,
    hotRetentionDays: 30,
    coldRetentionDays: 90,
    initialHotRetentionDays: 30,
    initialColdRetentionDays: 90,
    elasticStorage: 4 * 30 + 0.2 * 90,
    S3Storage: 3 * 90,
    totalRetentionDays: 30 + 90,
    indexNamesByTier: {
      hotTier: ['logs-production-1', 'logs-production-2'],
      coldTier: ['logs-production-3']
    },
    sourceNames: ['source1', 'source2222222222222222222222222222222222222'],
    canAddSources: true,
    showToUsers: true
  },
  {
    name: 'hot-forever',
    hebrewName: 'חם לנצח',
    elasticStoragePerHotTierDay: 4,
    S3StoragePerColdTierDay: 3,
    elasticStoragePerColdTierDay: 0.2,
    hotRetentionDays: Infinity,
    coldRetentionDays: 0,
    initialHotRetentionDays: Infinity,
    initialColdRetentionDays: 0,
    elasticStorage: 4 * 70 + 0.2 * 0,
    S3Storage: 3 * 90,
    totalRetentionDays: Infinity + 0,
    indexNamesByTier: {
      hotTier: ['forever-1', 'forever-2'],
      coldTier: []
    },
    sourceNames: [],
    canAddSources: false,
    showToUsers: false
  },
  {
    name: 'cold-forever',
    hebrewName: 'קר לנצח',
    elasticStoragePerHotTierDay: 4,
    S3StoragePerColdTierDay: 3,
    elasticStoragePerColdTierDay: 0.2,
    hotRetentionDays: 10,
    coldRetentionDays: Infinity,
    initialHotRetentionDays: 10,
    initialColdRetentionDays: Infinity,
    elasticStorage: 4 * 10 + 0.2 * 110,
    S3Storage: 3 * 90,
    totalRetentionDays: 5 + Infinity,
    indexNamesByTier: {
      hotTier: [],
      coldTier: ['forever-1', 'forever-2']
    },
    sourceNames: ['source3'],
    canAddSources: true,
    showToUsers: true
  },
  {
    name: 'metrics-app1',
    hebrewName: 'מדדים-אפליקציה1',
    elasticStoragePerHotTierDay: 2,
    S3StoragePerColdTierDay: 1.5,
    elasticStoragePerColdTierDay: 0.1,
    hotRetentionDays: 15,
    coldRetentionDays: 45,
    initialHotRetentionDays: 15,
    initialColdRetentionDays: 45,
    elasticStorage: 2 * 15 + 0.1 * 45,
    S3Storage: 1.5 * 45,
    totalRetentionDays: 15 + 45,
    indexNamesByTier: {
      hotTier: ['metrics-app1-1', 'metrics-app1-2'],
      coldTier: []
    },
    sourceNames: ['source4', 'source5', 'source6'],
    canAddSources: true,
    showToUsers: true
  },
  {
    name: 'metrics-app2',
    hebrewName: 'מדדים-אפליקציה2',
    elasticStoragePerHotTierDay: 3,
    S3StoragePerColdTierDay: 2,
    elasticStoragePerColdTierDay: 0.15,
    hotRetentionDays: 20,
    coldRetentionDays: 0,
    initialHotRetentionDays: 20,
    initialColdRetentionDays: 0,
    elasticStorage: 3 * 20 + 0.15 * 0,
    S3Storage: 0,
    totalRetentionDays: 20 + 0,
    indexNamesByTier: {
      hotTier: ['metrics-app2-1'],
      coldTier: []
    },
    sourceNames: [],
    canAddSources: true,
    showToUsers: true
  },
  {
    name: 'audit-logs',
    hebrewName: 'לוגים-ביקורת',
    elasticStoragePerHotTierDay: 1,
    S3StoragePerColdTierDay: 2.5,
    elasticStoragePerColdTierDay: 0.25,
    hotRetentionDays: 10,
    coldRetentionDays: 120,
    initialHotRetentionDays: 10,
    initialColdRetentionDays: 120,
    elasticStorage: 1 * 10 + 0.25 * 120,
    S3Storage: 2.5 * 120,
    totalRetentionDays: 10 + 120,
    indexNamesByTier: {
      hotTier: ['audit-logs-1'],
      coldTier: []
    },
    sourceNames: ['source7777777', 'source77', 'source777', 'source7777', 'source7', 'source77777', 'source7777777777777'],
    canAddSources: false,
    showToUsers: true
  },
  {
    name: 'user-activity',
    hebrewName: 'פעילות-משתמש',
    elasticStoragePerHotTierDay: 2.5,
    S3StoragePerColdTierDay: 2,
    elasticStoragePerColdTierDay: 0.12,
    hotRetentionDays: 25,
    coldRetentionDays: 60,
    initialHotRetentionDays: 25,
    initialColdRetentionDays: 60,
    elasticStorage: 2.5 * 25 + 0.12 * 60,
    S3Storage: 2 * 60,
    totalRetentionDays: 25 + 60,
    indexNamesByTier: {
      hotTier: ['user-activity-1'],
      coldTier: []
    },
    sourceNames: ['source8', 'source9'],
    canAddSources: true,
    showToUsers: false
  }
];

export const clusterBIndices: SourceGroup[] = [
  {
    name: 'metrics-app1',
    hebrewName: 'מדדים-אפליקציה1',
    elasticStoragePerHotTierDay: 2,
    S3StoragePerColdTierDay: 1.5,
    elasticStoragePerColdTierDay: 0.1,
    hotRetentionDays: 15,
    coldRetentionDays: 45,
    initialHotRetentionDays: 15,
    initialColdRetentionDays: 45,
    elasticStorage: 2 * 15 + 0.1 * 45,
    S3Storage: 1.5 * 45,
    totalRetentionDays: 15 + 45,
    indexNamesByTier: {
      hotTier: ['metrics-app1-1', 'metrics-app1-2'],
      coldTier: []
    },
    sourceNames: ['source10', 'source11'],
    canAddSources: true,
    showToUsers: true
  },
  {
    name: 'metrics-app2',
    hebrewName: 'מדדים-אפליקציה2',
    elasticStoragePerHotTierDay: 3,
    S3StoragePerColdTierDay: 2,
    elasticStoragePerColdTierDay: 0.15,
    hotRetentionDays: 20,
    coldRetentionDays: 70,
    initialHotRetentionDays: 20,
    initialColdRetentionDays: 70,
    elasticStorage: 3 * 20 + 0.15 * 70,
    S3Storage: 2 * 70,
    totalRetentionDays: 20 + 70,
    indexNamesByTier: {
      hotTier: ['metrics-app2-1', 'metrics-app2-2'],
      coldTier: []
    },
    sourceNames: [],
    canAddSources: true,
    showToUsers: true
  },
  {
    name: 'audit-logs',
    hebrewName: 'לוגים-ביקורת',
    elasticStoragePerHotTierDay: 1,
    S3StoragePerColdTierDay: 2.5,
    elasticStoragePerColdTierDay: 0.25,
    hotRetentionDays: 10,
    coldRetentionDays: 120,
    initialHotRetentionDays: 10,
    initialColdRetentionDays: 120,
    elasticStorage: 1 * 10 + 0.25 * 120,
    S3Storage: 2.5 * 120,
    totalRetentionDays: 10 + 120,
    indexNamesByTier: {
      hotTier: ['audit-logs-1'],
      coldTier: []
    },
    sourceNames: ['source12'],
    canAddSources: false,
    showToUsers: true
  },
  {
    name: 'user-activity',
    hebrewName: 'פעילות-משתמש',
    elasticStoragePerHotTierDay: 2.5,
    S3StoragePerColdTierDay: 2,
    elasticStoragePerColdTierDay: 0.12,
    hotRetentionDays: 25,
    coldRetentionDays: 60,
    initialHotRetentionDays: 25,
    initialColdRetentionDays: 60,
    elasticStorage: 2.5 * 25 + 0.12 * 60,
    S3Storage: 2 * 60,
    totalRetentionDays: 25 + 60,
    indexNamesByTier: {
      hotTier: ['user-activity-1'],
      coldTier: []
    },
    sourceNames: ['source13', 'source14'],
    canAddSources: true,
    showToUsers: false
  }
];
