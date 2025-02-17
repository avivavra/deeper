import { ClusterData } from "./models";

export const clusters: ClusterData[] = [
  {
    name: 'Cluster A',
    hebrewName: 'אשכול א',
    totalElasticStorage: 500, // GB
    // usedElasticStorage: 342.2, // GB
    totalS3Storage: 1000, // GB
    // usedS3Storage: 757.5 // GB
  },
  {
    name: 'Cluster B',
    hebrewName: 'אשכול ב',
    totalElasticStorage: 300, // GB
    // usedElasticStorage: 214.7, // GB
    totalS3Storage: 900, // GB
    // usedS3Storage: 627.5 // GB
  }
];

export const clusterAIndices = [
  {
    name: 'logs-production',
    hebrewName: 'לוגים-ייצור',
    elasticStoragePerHotTierDay: 4,
    S3StoragePerColdTierDay: 3,
    elasticStoragePerColdTierDay: 0.2,
    hotRetentionDays: 30,
    coldRetentionDays: 90,
    elasticStorageGB: 4 * 30 + 0.2 * 90,
    S3StorageGB: 3 * 90,
    totalRetentionDays: 30 + 90
  },
  {
    name: 'metrics-app1',
    hebrewName: 'מדדים-אפליקציה1',
    elasticStoragePerHotTierDay: 2,
    S3StoragePerColdTierDay: 1.5,
    elasticStoragePerColdTierDay: 0.1,
    hotRetentionDays: 15,
    coldRetentionDays: 45,
    elasticStorageGB: 2 * 15 + 0.1 * 45,
    S3StorageGB: 1.5 * 45,
    totalRetentionDays: 15 + 45
  },
  {
    name: 'metrics-app2',
    hebrewName: 'מדדים-אפליקציה2',
    elasticStoragePerHotTierDay: 3,
    S3StoragePerColdTierDay: 2,
    elasticStoragePerColdTierDay: 0.15,
    hotRetentionDays: 20,
    coldRetentionDays: 0,
    elasticStorageGB: 3 * 20 + 0.15 * 0,
    S3StorageGB: 0,
    totalRetentionDays: 20 + 0
  },
  {
    name: 'audit-logs',
    hebrewName: 'לוגים-ביקורת',
    elasticStoragePerHotTierDay: 1,
    S3StoragePerColdTierDay: 2.5,
    elasticStoragePerColdTierDay: 0.25,
    hotRetentionDays: 10,
    coldRetentionDays: 120,
    elasticStorageGB: 1 * 10 + 0.25 * 120,
    S3StorageGB: 2.5 * 120,
    totalRetentionDays: 10 + 120
  },
  {
    name: 'user-activity',
    hebrewName: 'פעילות-משתמש',
    elasticStoragePerHotTierDay: 2.5,
    S3StoragePerColdTierDay: 2,
    elasticStoragePerColdTierDay: 0.12,
    hotRetentionDays: 25,
    coldRetentionDays: 60,
    elasticStorageGB: 2.5 * 25 + 0.12 * 60,
    S3StorageGB: 2 * 60,
    totalRetentionDays: 25 + 60
  }
];

export const clusterBIndices = [
  {
    name: 'metrics-app1',
    hebrewName: 'מדדים-אפליקציה1',
    elasticStoragePerHotTierDay: 2,
    S3StoragePerColdTierDay: 1.5,
    elasticStoragePerColdTierDay: 0.1,
    hotRetentionDays: 15,
    coldRetentionDays: 45,
    elasticStorageGB: 2 * 15 + 0.1 * 45,
    S3StorageGB: 1.5 * 45,
    totalRetentionDays: 15 + 45
  },
  {
    name: 'metrics-app2',
    hebrewName: 'מדדים-אפליקציה2',
    elasticStoragePerHotTierDay: 3,
    S3StoragePerColdTierDay: 2,
    elasticStoragePerColdTierDay: 0.15,
    hotRetentionDays: 20,
    coldRetentionDays: 70,
    elasticStorageGB: 3 * 20 + 0.15 * 70,
    S3StorageGB: 2 * 70,
    totalRetentionDays: 20 + 70
  },
  {
    name: 'audit-logs',
    hebrewName: 'לוגים-ביקורת',
    elasticStoragePerHotTierDay: 1,
    S3StoragePerColdTierDay: 2.5,
    elasticStoragePerColdTierDay: 0.25,
    hotRetentionDays: 10,
    coldRetentionDays: 120,
    elasticStorageGB: 1 * 10 + 0.25 * 120,
    S3StorageGB: 2.5 * 120,
    totalRetentionDays: 10 + 120
  },
  {
    name: 'user-activity',
    hebrewName: 'פעילות-משתמש',
    elasticStoragePerHotTierDay: 2.5,
    S3StoragePerColdTierDay: 2,
    elasticStoragePerColdTierDay: 0.12,
    hotRetentionDays: 25,
    coldRetentionDays: 60,
    elasticStorageGB: 2.5 * 25 + 0.12 * 60,
    S3StorageGB: 2 * 60,
    totalRetentionDays: 25 + 60
  }
];
