import React from 'react';
import { Direction, Translation } from '../models';
import { config } from '../../../../config';
import { FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';
import { TooltipIcon } from '../../../components/TooltipIcon';

type StorageUsageOverviewProps = {
  usedElasticStorage: number;
  totalElasticStorage: number;
  elasticStoragePercentage: number;
  usedS3Storage: number;
  totalS3Storage: number;
  s3StoragePercentage: number;
  t: Translation;
  direction: Direction;
};

const StorageBar: React.FC<{
  label: string | React.ReactNode;
  usedStorage: number;
  totalStorage: number;
  storagePercentage: number;
  direction: Direction;
}> = ({ label, usedStorage, totalStorage, storagePercentage, direction }) => {
  const getStorageBarColor = (percentage: number) => {
    if (percentage > config.storageThresholds.high) return 'bg-red-500';
    if (percentage > config.storageThresholds.medium) return 'bg-orange-500';
    return 'bg-teal-600';
  };

  const isWarningZone = (percentage: number) => {
    return percentage > config.storageThresholds.medium && percentage <= config.storageThresholds.high;
  };

  const isErrorZone = (percentage: number) => {
    return percentage > config.storageThresholds.high;
  };

  const marginClassName = direction === 'ltr' ? 'ml-' : 'mr-';

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="font-medium text-gray-800">{label}</span>
        <span className={usedStorage > totalStorage ? "text-red-500 font-medium" : "text-gray-800"}>
          <span dir='ltr'>{usedStorage.toFixed(2)}/{totalStorage.toFixed(2)} GB ({Number(storagePercentage).toFixed(1)}%)</span>
          {isWarningZone(storagePercentage) && <FaExclamationTriangle className={`text-orange-500 inline ${marginClassName}1`} />}
          {isErrorZone(storagePercentage) && <FaExclamationCircle className={`text-red-500 inline ${marginClassName}1`} />}
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
  usedElasticStorage,
  totalElasticStorage,
  elasticStoragePercentage,
  usedS3Storage,
  totalS3Storage,
  s3StoragePercentage,
  t,
  direction,
}) => {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{t.storageUsageOverview}</h2>
      </div>
      <div className="space-y-6">
        <StorageBar
          direction={direction}
          label={
            <>
              {t.elasticsearchStorage}
              <TooltipIcon content={t.elasticsearchStorageExplanation} alignment={direction === 'rtl' ? 'right' : 'left'} />
            </>
          }
          usedStorage={usedElasticStorage}
          totalStorage={totalElasticStorage}
          storagePercentage={elasticStoragePercentage}
        />
        <StorageBar
          direction={direction}
          label={
            <>
              {t.s3Storage}
              <TooltipIcon content={t.s3StorageExplanation} alignment={direction === 'rtl' ? 'right' : 'left'} />
            </>
          }
          usedStorage={usedS3Storage}
          totalStorage={totalS3Storage}
          storagePercentage={s3StoragePercentage}
        />
      </div>
    </div>
  );
};
