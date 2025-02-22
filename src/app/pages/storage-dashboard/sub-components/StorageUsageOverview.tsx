import React from 'react';
import { DisplayMethod, Translation } from '../models';
import { config } from '@/config';
import { FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';

type StorageUsageOverviewProps = {
  displayMethod: DisplayMethod;
  usedCombinedStorage: number;
  combinedStorage: number;
  combinedStoragePercentage: number;
  usedElasticStorage: number;
  totalElasticStorage: number;
  elasticStoragePercentage: number;
  usedS3Storage: number;
  totalS3Storage: number;
  s3StoragePercentage: number;
  t: Translation;
};

const StorageBar: React.FC<{
  label: string;
  usedStorage: number;
  totalStorage: number;
  storagePercentage: number;
}> = ({ label, usedStorage, totalStorage, storagePercentage }) => {
  const getStorageBarColor = (percentage: number) => {
    if (percentage > config.storageThresholds.high) return 'bg-red-500';
    if (percentage > config.storageThresholds.medium) return 'bg-orange-500';
    return 'bg-blue-600';
  };

  const isWarningZone = (percentage: number) => {
    return percentage > config.storageThresholds.medium && percentage <= config.storageThresholds.high;
  };

  const isErrorZone = (percentage: number) => {
    return percentage > config.storageThresholds.high;
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="font-medium text-gray-800">{label}</span>
        <span className={usedStorage > totalStorage ? "text-red-500 font-medium" : "text-gray-800"}>
          <span dir='ltr'>{usedStorage.toFixed(2)}/{totalStorage.toFixed(2)} GB ({Number(storagePercentage).toFixed(1)}%)</span>
          {isWarningZone(storagePercentage) && <FaExclamationTriangle className="text-orange-500 inline ml-1 mr-1" />}
          {isErrorZone(storagePercentage) && <FaExclamationCircle className="text-red-500 inline ml-1 mr-1" />}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
        <div
          className={`h-4 rounded-full ${getStorageBarColor(storagePercentage)}`}
          style={{ width: `${Math.min(storagePercentage, 100)}%` }}
        />
      </div>
    </div>
  )
};

export const StorageUsageOverview: React.FC<StorageUsageOverviewProps> = ({
  displayMethod,
  usedCombinedStorage,
  combinedStorage,
  combinedStoragePercentage,
  usedElasticStorage,
  totalElasticStorage,
  elasticStoragePercentage,
  usedS3Storage,
  totalS3Storage,
  s3StoragePercentage,
  t,
}) => {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{t.storageUsageOverview}</h2>
      </div>
      <div className="space-y-6">
        {displayMethod === 'combined' ? (
          <StorageBar
            label={t.storage}
            usedStorage={usedCombinedStorage}
            totalStorage={combinedStorage}
            storagePercentage={combinedStoragePercentage}
          />
        ) : (
          <>
            <StorageBar
              label={t.elasticsearchStorage}
              usedStorage={usedElasticStorage}
              totalStorage={totalElasticStorage}
              storagePercentage={elasticStoragePercentage}
            />
            <StorageBar
              label={t.s3Storage}
              usedStorage={usedS3Storage}
              totalStorage={totalS3Storage}
              storagePercentage={s3StoragePercentage}
            />
          </>
        )}
      </div>
    </div>
  );
};
