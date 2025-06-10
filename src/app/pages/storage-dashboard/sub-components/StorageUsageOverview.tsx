import React from 'react';
import { Direction, Translation } from '../models';
import { config } from '../../../../config';
import { FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';
import { TooltipIcon } from '../../../components/TooltipIcon';
import { AsyncState, format } from '../../../utils';

type StorageUsageOverviewProps = {
  usedElasticStorage: number;
  totalElasticStorage: number;
  elasticStoragePercentage: number;
  usedS3Storage: number;
  totalS3Storage: number;
  s3StoragePercentage: number;
  t: Translation;
  direction: Direction;
  thresholdMode?: 'none' | 'medium' | 'high' | number;
  actionButtons?: React.ReactNode;
  elasticColdTierStorage?: AsyncState<number>;
  divideHotAndColdTier?: boolean;
};

const RegularStorageBar: React.FC<{
  label: string | React.ReactNode;
  usedStorage: number;
  totalStorage: number;
  storagePercentage: number;
  direction: Direction;
  coldTierStorage?: AsyncState<number>;
  divideHotAndColdTier?: boolean;
}> = ({ label, usedStorage, totalStorage, storagePercentage, direction, coldTierStorage, divideHotAndColdTier }) => {
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

  const marginClassName = direction === 'ltr' ? 'ml-' : 'mr-';

  // Only show split bar if divideHotAndColdTier is true
  if (
    divideHotAndColdTier &&
    coldTierStorage &&
    coldTierStorage.status === 'succeeded' &&
    typeof coldTierStorage.data === 'number'
  ) {
    const coldTierValue = coldTierStorage.data;
    const hotTierStorage = Math.max(usedStorage - coldTierValue, 0);
    const hotTierPercent = totalStorage ? (hotTierStorage / totalStorage) * 100 : 0;
    const coldTierPercent = totalStorage ? (coldTierValue / totalStorage) * 100 : 0;

    return (
      <div>
        <div className="flex justify-between mb-2">
          <span className="font-medium text-gray-800">{label}</span>
          <span className={usedStorage > totalStorage ? "text-red-500 font-medium" : "text-gray-800"}>
            <span dir='ltr'>
              <span className="text-pink-500">{format.numberToFixed(hotTierStorage)} GB</span>
              <span className="mx-2 text-gray-400 font-normal">|</span>
              <span className="text-blue-600">{format.numberToFixed(coldTierValue)} GB</span>
              <span className="mx-2 text-gray-400 font-normal">|</span>
              <span>{format.numberToFixed(usedStorage)} GB</span>
              {' / '}
              <span>{format.numberToFixed(totalStorage)} GB</span>
              {' ('}{format.numberToFixed(storagePercentage, 1)}%{')'}
            </span>
            {isWarningZone(storagePercentage) && <FaExclamationTriangle className={`text-orange-500 inline ${marginClassName}1`} />}
            {isErrorZone(storagePercentage) && <FaExclamationCircle className={`text-red-500 inline ${marginClassName}1`} />}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden flex">
          <div
            className="h-4 rounded-l-full bg-pink-400"
            style={{ width: `${Math.min(hotTierPercent, 100)}%` }}
          />
          <div
            className="h-4 bg-blue-600"
            style={{
              width: `${Math.min(coldTierPercent, 100)}%`,
              borderTopRightRadius: coldTierPercent > 0 ? '9999px' : undefined,
              borderBottomRightRadius: coldTierPercent > 0 ? '9999px' : undefined,
            }}
          />
        </div>
      </div>
    );
  }

  // fallback: show regular bar
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="font-medium text-gray-800">{label}</span>
        <span className={usedStorage > totalStorage ? "text-red-500 font-medium" : "text-gray-800"}>
          <span dir='ltr'>{format.numberToFixed(usedStorage)}/{format.numberToFixed(totalStorage)} GB ({format.numberToFixed(storagePercentage, 1)}%)</span>
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

const ThresholdStorageBar: React.FC<{
  label: string | React.ReactNode;
  usedStorage: number;
  totalStorage: number;
  direction: Direction;
  thresholdMode: 'medium' | 'high' | number;
}> = ({ label, usedStorage, totalStorage, direction, thresholdMode }) => {
  const getThresholdTotalStorage = () => {
    if (typeof thresholdMode === 'number') return totalStorage * (thresholdMode / 100);
    if (thresholdMode === 'medium') return totalStorage * (config.storageThresholds.medium / 100);
    if (thresholdMode === 'high') return totalStorage * (config.storageThresholds.high / 100);
    return totalStorage;
  };

  const adjustedTotalStorage = getThresholdTotalStorage();

  const storagePercentage = adjustedTotalStorage ? (usedStorage / adjustedTotalStorage) * 100 : 0;
  const isErrorZone = storagePercentage > 100;

  const marginClassName = direction === 'ltr' ? 'ml-' : 'mr-';

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="font-medium text-gray-800">{label}</span>
        <span className={isErrorZone ? "text-red-500 font-medium" : "text-gray-800"}>
          <span dir='ltr'>{format.numberToFixed(usedStorage)}/{format.numberToFixed(adjustedTotalStorage)} GB ({format.numberToFixed(storagePercentage, 1)}%)</span>
          {isErrorZone && <FaExclamationCircle className={`text-red-500 inline ${marginClassName}1`} />}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
        <div
          className={`h-4 rounded-full ${isErrorZone ? 'bg-red-500' : 'bg-blue-600'}`}
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
  thresholdMode = 'none',
  actionButtons,
  elasticColdTierStorage,
  divideHotAndColdTier,
}) => {
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">{t.storageUsageOverview}</h2>
        <div className="flex items-center space-x-4">
          {actionButtons && <div>{actionButtons}</div>}
        </div>
      </div>
      <div className="space-y-6">
        {thresholdMode === 'none' ? (
          <RegularStorageBar
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
            coldTierStorage={elasticColdTierStorage}
            divideHotAndColdTier={divideHotAndColdTier}
          />
        ) : (
          <ThresholdStorageBar
            direction={direction}
            label={
              <>
                {t.elasticsearchStorage}
                <TooltipIcon content={t.elasticsearchStorageExplanation} alignment={direction === 'rtl' ? 'right' : 'left'} />
              </>
            }
            usedStorage={usedElasticStorage}
            totalStorage={totalElasticStorage}
            thresholdMode={thresholdMode}
          />
        )}
        {thresholdMode === 'none' ? (
          <RegularStorageBar
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
        ) : (
          <ThresholdStorageBar
            direction={direction}
            label={
              <>
                {t.s3Storage}
                <TooltipIcon content={t.s3StorageExplanation} alignment={direction === 'rtl' ? 'right' : 'left'} />
              </>
            }
            usedStorage={usedS3Storage}
            totalStorage={totalS3Storage}
            thresholdMode={thresholdMode}
          />
        )}
      </div>
    </div>
  );
};
