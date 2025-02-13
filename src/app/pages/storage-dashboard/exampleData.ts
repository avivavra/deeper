import { ClusterData } from "./models";

export const clusters: ClusterData[] = [
  {
    name: 'Cluster A',
    hebrewName: 'אשכול א',
    indices: [
      {
        name: 'logs-production',
        hebrewName: 'לוגים-ייצור',
        elasticStoragePerHotTierDay: 4,
        S3StoragePerColdTierDay: 3,
        elasticStoragePerColdTierDay: 0.2,
        hotRetentionDays: 30,
        coldRetentionDays: 90,
        elasticStorageGB: 120,
        S3StorageGB: 270,
        totalRetentionDays: 120
      },
      {
        name: 'metrics-app1',
        hebrewName: 'מדדים-אפליקציה1',
        elasticStoragePerHotTierDay: 2,
        S3StoragePerColdTierDay: 1.5,
        elasticStoragePerColdTierDay: 0.1,
        hotRetentionDays: 15,
        coldRetentionDays: 45,
        elasticStorageGB: 30,
        S3StorageGB: 67.5,
        totalRetentionDays: 60
      },
      {
        name: 'metrics-app2',
        hebrewName: 'מדדים-אפליקציה2',
        elasticStoragePerHotTierDay: 3,
        S3StoragePerColdTierDay: 2,
        elasticStoragePerColdTierDay: 0.15,
        hotRetentionDays: 20,
        coldRetentionDays: 0,
        elasticStorageGB: 60,
        S3StorageGB: 0,
        totalRetentionDays: 20
      },
      {
        name: 'audit-logs',
        hebrewName: 'לוגים-ביקורת',
        elasticStoragePerHotTierDay: 1,
        S3StoragePerColdTierDay: 2.5,
        elasticStoragePerColdTierDay: 0.25,
        hotRetentionDays: 10,
        coldRetentionDays: 120,
        elasticStorageGB: 10,
        S3StorageGB: 300,
        totalRetentionDays: 130
      },
      {
        name: 'user-activity',
        hebrewName: 'פעילות-משתמש',
        elasticStoragePerHotTierDay: 2.5,
        S3StoragePerColdTierDay: 2,
        elasticStoragePerColdTierDay: 0.12,
        hotRetentionDays: 25,
        coldRetentionDays: 60,
        elasticStorageGB: 62.5,
        S3StorageGB: 120,
        totalRetentionDays: 85
      }
    ]
  },
  {
    name: 'Cluster B',
    hebrewName: 'אשכול ב',
    indices: [
      {
        name: 'metrics-app1',
        hebrewName: 'מדדים-אפליקציה1',
        elasticStoragePerHotTierDay: 2,
        S3StoragePerColdTierDay: 1.5,
        elasticStoragePerColdTierDay: 0.1,
        hotRetentionDays: 15,
        coldRetentionDays: 45,
        elasticStorageGB: 30,
        S3StorageGB: 67.5,
        totalRetentionDays: 60
      },
      {
        name: 'metrics-app2',
        hebrewName: 'מדדים-אפליקציה2',
        elasticStoragePerHotTierDay: 3,
        S3StoragePerColdTierDay: 2,
        elasticStoragePerColdTierDay: 0.15,
        hotRetentionDays: 20,
        coldRetentionDays: 70,
        elasticStorageGB: 60,
        S3StorageGB: 140,
        totalRetentionDays: 90
      },
      {
        name: 'audit-logs',
        hebrewName: 'לוגים-ביקורת',
        elasticStoragePerHotTierDay: 1,
        S3StoragePerColdTierDay: 2.5,
        elasticStoragePerColdTierDay: 0.25,
        hotRetentionDays: 10,
        coldRetentionDays: 120,
        elasticStorageGB: 10,
        S3StorageGB: 300,
        totalRetentionDays: 130
      },
      {
        name: 'user-activity',
        hebrewName: 'פעילות-משתמש',
        elasticStoragePerHotTierDay: 2.5,
        S3StoragePerColdTierDay: 2,
        elasticStoragePerColdTierDay: 0.12,
        hotRetentionDays: 25,
        coldRetentionDays: 60,
        elasticStorageGB: 62.5,
        S3StorageGB: 120,
        totalRetentionDays: 85
      }
    ]
  }
];