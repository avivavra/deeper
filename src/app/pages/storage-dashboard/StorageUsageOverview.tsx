import React from 'react';

type StorageUsageOverviewProps = {
  audience: string;
  usedCombinedStorage: number;
  combinedStorage: number;
  combinedStoragePercentage: number;
  usedElasticStorage: number;
  totalElasticStorage: number;
  elasticStoragePercentage: number;
  usedS3Storage: number;
  totalS3Storage: number;
  s3StoragePercentage: number;
  t: {
    storageUsageOverview: string;
    storage: string;
    elasticsearchStorage: string;
    s3Storage: string;
    overLimit: string;
  };
  getStorageBarColor: (percentage: number) => string;
};

const StorageUsageOverview: React.FC<StorageUsageOverviewProps> = ({
  audience,
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
  getStorageBarColor
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{t.storageUsageOverview}</h2>
      </div>
      <div className="space-y-6">
        {audience === 'user' ? (
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-gray-800">{t.storage}</span>
              <span className={usedCombinedStorage > combinedStorage ? "text-red-500 font-medium" : "text-gray-800"}>
                <span dir='ltr'>{usedCombinedStorage}/{combinedStorage} GB</span>
                <span> ({combinedStoragePercentage.toFixed(1)}%)</span>
                {usedCombinedStorage > combinedStorage && ` (${t.overLimit})`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
              <div
                className={`h-4 rounded-full ${getStorageBarColor(combinedStoragePercentage)}`}
                style={{ width: `${Math.min(combinedStoragePercentage, 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-800">{t.elasticsearchStorage}</span>
                <span className={usedElasticStorage > totalElasticStorage ? "text-red-500 font-medium" : "text-gray-800"}>
                  {usedElasticStorage}/{totalElasticStorage} GB ({elasticStoragePercentage.toFixed(1)}%)
                  {usedElasticStorage > totalElasticStorage && ` (${t.overLimit})`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                <div
                  className={`h-4 rounded-full ${getStorageBarColor(elasticStoragePercentage)}`}
                  style={{ width: `${Math.min(elasticStoragePercentage, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-800">{t.s3Storage}</span>
                <span className={usedS3Storage > totalS3Storage ? "text-red-500 font-medium" : "text-gray-800"}>
                  {usedS3Storage}/{totalS3Storage} GB ({s3StoragePercentage.toFixed(1)}%)
                  {usedS3Storage > totalS3Storage && ` (${t.overLimit})`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                <div
                  className={`h-4 rounded-full ${getStorageBarColor(s3StoragePercentage)}`}
                  style={{ width: `${Math.min(s3StoragePercentage, 100)}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StorageUsageOverview;
