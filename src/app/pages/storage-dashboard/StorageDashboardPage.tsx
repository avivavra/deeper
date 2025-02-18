"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Audience, ChangeLogEntry, ClusterData, ClusterMetadata, Direction, DisplayMethod, IndexData, NewIndexInputType, Translation } from './models';
import { translations } from './translations';
import ChangeLog from './ChangeLog';
import StorageHeader from './StorageHeader';
import StorageUsageOverview from './StorageUsageOverview';
import IndexRetentionPeriodsChart from './IndexRetentionPeriodsChart';
import IndexRetentionManagement from './IndexRetentionManagement';
import AddIndexForm from './AddIndexForm';
import GenericModal from '../../components/GenericModal';
import { config } from '../../../config/config';
import { ClustersApi } from '@/api/clusters/clustersApi';
import StorageDashboardLayout from './StorageDashboardLayout';
import useAsyncState from '../../utils/useAsyncState';
import { FaCircleNotch, FaTimesCircle } from 'react-icons/fa';

import './StorageDashboardPage.css';

type StorageDashboardPageProps = {
  clustersApi: ClustersApi;
  clustersMetadata: ClusterMetadata[];
};

const useAudience = () => {
  const [audience, setAudience] = useState<Audience>(config.defaultMode as Audience);
  const direction: Direction = audience === 'user' ? 'rtl' : 'ltr';
  const t = translations[audience === 'user' ? 'hebrew' : 'english'];

  useEffect(() => {
    document.documentElement.dir = direction;
  }, [audience]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        setAudience(prev => (prev === 'developer' ? 'user' : 'developer'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { audience, setAudience, direction, t };
};

const useEditMode = () => {
  const [isEditMode, setIsEditMode] = useState(false);

  const handleEditModeToggle = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        handleEditModeToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleEditModeToggle]);

  return { isEditMode, handleEditModeToggle };
};

const useCluster = (clustersApi: ClustersApi, clustersMetadata: ClusterMetadata[]) => {
  const [selectedClusterMetadata, setSelectedClusterMetadata] = useState<ClusterMetadata>(clustersMetadata[0]);

  const fetchInitialClusterStorage = useCallback(async () => {
    const clustersStorage = await clustersApi.getClusterStorage(clustersMetadata[0].name);

    return {
      ...(clustersMetadata[0]),
      ...clustersStorage
    };
  }, [clustersMetadata, clustersApi]);

  const { state: selectedCluster, fetchData: setSelectedCluster } = useAsyncState<ClusterData>(fetchInitialClusterStorage);

  const handleSetSelectedCluster = useCallback((clusterName: string) => {
    const clusterMetadata = clustersMetadata.find(c => c.name === clusterName);
    if (clusterMetadata) {
      setSelectedClusterMetadata(clusterMetadata);
      setSelectedCluster(async () => {
        const clusterStorage = await clustersApi.getClusterStorage(clusterName);

        return {
          ...clusterMetadata,
          ...clusterStorage
        };
      });
    }
  }, [clustersApi, clustersMetadata, setSelectedCluster]);

  const { state: indices, fetchData: setIndices } = useAsyncState<IndexData[]>([]);

  useEffect(() => {
    setIndices(() => clustersApi.getIndices(selectedClusterMetadata.name));
  }, [setIndices, clustersApi, selectedClusterMetadata.name]);

  const totalElasticStorage = selectedCluster.data?.totalElasticStorage || 0;
  const totalS3Storage = selectedCluster.data?.totalS3Storage || 0;
  const combinedStorage = totalElasticStorage + totalS3Storage;

  return {
    selectedClusterMetadata,
    selectedCluster,
    handleSetSelectedCluster,
    indices,
    totalElasticStorage,
    totalS3Storage,
    combinedStorage
  };
};

const StorageDashboardPage = ({ clustersApi, clustersMetadata }: StorageDashboardPageProps) => {
  const { audience, setAudience, direction, t } = useAudience();
  const { isEditMode, handleEditModeToggle } = useEditMode();
  const { selectedClusterMetadata, selectedCluster, handleSetSelectedCluster, indices, totalElasticStorage, totalS3Storage, combinedStorage } = useCluster(clustersApi, clustersMetadata);

  const [displayIndices, setDisplayIndices] = useState<IndexData[]>([]);
  const [indicesSelection, setIndicesSelection] = useState<{ [key: string]: boolean }>({});
  const [changeLog, setChangeLog] = useState<{ [key: string]: ChangeLogEntry }>({});
  const [showAddIndex, setShowAddIndex] = useState(false);

  const handleResetChanges = () => {
    if (indices.status === 'succeeded' && indices.data) {
      setDisplayIndices(indices.data);
      setChangeLog({});
      setIndicesSelection(indices.data.reduce((acc, index) => ({ ...acc, [index.name]: true }), {}));
    }
  };

  useEffect(() => {
    if (indices.status === 'succeeded') {
      const indicesData = indices.data;
      setDisplayIndices(indicesData);
      setIndicesSelection(indicesData.reduce((acc, index) => ({ ...acc, [index.name]: true }), {}));
    }

    handleResetChanges();
  }, [indices]);

  const digits = 2;
  const usedElasticStorage = displayIndices ? parseFloat(displayIndices.reduce((acc, curr) => acc + curr.elasticStorageGB, 0).toFixed(digits)) : 0;
  const usedS3Storage = displayIndices ? parseFloat(displayIndices.reduce((acc, curr) => acc + curr.S3StorageGB, 0).toFixed(digits)) : 0;
  const elasticStoragePercentage = totalElasticStorage ? parseFloat(((usedElasticStorage / totalElasticStorage) * 100).toFixed(digits)) : 0;
  const s3StoragePercentage = totalS3Storage ? parseFloat(((usedS3Storage / totalS3Storage) * 100).toFixed(digits)) : 0;
  const usedCombinedStorage = parseFloat((usedElasticStorage + usedS3Storage).toFixed(digits));

  const combinedStoragePercentage = combinedStorage ? parseFloat(((usedCombinedStorage / combinedStorage) * 100).toFixed(digits)) : 0;

  const filteredIndices = displayIndices ? displayIndices.filter(index => indicesSelection[index.name]) : [];

  const handleAddIndex = (newIndex: IndexData) => {
    setDisplayIndices([newIndex, ...displayIndices]);
    setIndicesSelection(prev => ({ ...prev, [newIndex.name]: true }));
    setChangeLog(prev => ({
      ...prev,
      [newIndex.name]: {
        original: {
          hotDays: 0,
          coldDays: 0,
          elasticStorage: 0,
          s3Storage: 0,
        },
        current: {
          hotDays: newIndex.hotRetentionDays,
          coldDays: newIndex.coldRetentionDays,
          elasticStorage: newIndex.elasticStorageGB,
          s3Storage: newIndex.S3StorageGB,
        }
      }
    }));
    setShowAddIndex(false);
  };

  const handleIndexToggle = (indexName: string) => {
    setIndicesSelection(prev => ({
      ...prev,
      [indexName]: !prev[indexName]
    }));
  };

  const handleIndexRetentionChange = (indexName: string, newHotDays: number, newColdDays: number) => {
    setDisplayIndices(prevIndices => {
      const updatedIndices = prevIndices.map(index => {
        if (index.name === indexName) {
          const newElasticStorage = Math.round(
            (index.elasticStoragePerHotTierDay * newHotDays) +
            (index.elasticStoragePerColdTierDay * newColdDays)
          );
          const newS3Storage = Math.round(
            index.S3StoragePerColdTierDay * newColdDays
          );

          return {
            ...index,
            hotRetentionDays: newHotDays,
            coldRetentionDays: newColdDays,
            totalRetentionDays: newHotDays + newColdDays,
            elasticStorageGB: newElasticStorage,
            S3StorageGB: newS3Storage
          };
        }
        return index;
      });

      const updatedIndex = updatedIndices.find(i => i.name === indexName) as IndexData;
      const originalIndex = indices.data?.find(i => i.name === indexName);

      setChangeLog(prev => ({
        ...prev,
        [indexName]: {
          original: {
            hotDays: originalIndex ? originalIndex.hotRetentionDays : 0,
            coldDays: originalIndex ? originalIndex.coldRetentionDays : 0,
            elasticStorage: originalIndex ? originalIndex.elasticStorageGB : 0,
            s3Storage: originalIndex ? originalIndex.S3StorageGB : 0,
          },
          current: {
            hotDays: newHotDays,
            coldDays: newColdDays,
            elasticStorage: updatedIndex.elasticStorageGB,
            s3Storage: updatedIndex.S3StorageGB,
          }
        }
      }));

      return updatedIndices;
    });
  };

  const handleTotalRetentionChange = (indexName: string, newTotalDays: number) => {
    setDisplayIndices(prevIndices => {
      const newIndices = prevIndices.map(index => {
        if (index.name === indexName) {
          const originalIndex = indices.data?.find(i => i.name === indexName);

          const originalHotDays = originalIndex ? originalIndex.hotRetentionDays : index.initialHotRetentionDays;
          const originalColdDays = originalIndex ? originalIndex.coldRetentionDays : index.initialColdRetentionDays;

          let newHotDays = newTotalDays > originalHotDays ? originalHotDays : newTotalDays;
          let newColdDays = newTotalDays > originalHotDays ? newTotalDays - originalHotDays : 0;

          if (originalColdDays === 0) {
            newHotDays = newTotalDays;
            newColdDays = 0;
          }

          const newElasticStorage = Math.round(
            (index.elasticStoragePerHotTierDay * newHotDays) +
            (index.elasticStoragePerColdTierDay * newColdDays)
          );
          const newS3Storage = Math.round(
            index.S3StoragePerColdTierDay * newColdDays
          );

          return {
            ...index,
            hotRetentionDays: newHotDays,
            coldRetentionDays: newColdDays,
            totalRetentionDays: newTotalDays,
            elasticStorageGB: newElasticStorage,
            S3StorageGB: newS3Storage
          };
        }
        return index;
      });

      const newIndex = newIndices.find(i => i.name === indexName);
      const originalIndex = indices.data?.find(i => i.name === indexName);

      setChangeLog(prev => ({
        ...prev,
        [indexName]: {
          original: {
            hotDays: originalIndex ? originalIndex.hotRetentionDays : 0,
            coldDays: originalIndex ? originalIndex.coldRetentionDays : 0,
            elasticStorage: originalIndex ? originalIndex.elasticStorageGB : 0,
            s3Storage: originalIndex ? originalIndex.S3StorageGB : 0,
          },
          current: {
            hotDays: newIndex?.hotRetentionDays || 0,
            coldDays: newIndex?.coldRetentionDays || 0,
            elasticStorage: newIndex?.elasticStorageGB || 0,
            s3Storage: newIndex?.S3StorageGB || 0,
          }
        }
      }));

      return newIndices;
    });
  };

  const handleRevertChange = (indexName: string) => {
    const originalIndex = indices.data?.find(i => i.name === indexName);
    if (!originalIndex) {
      // If the index was newly added, remove it
      setDisplayIndices(prevIndices => prevIndices.filter(index => index.name !== indexName));
      setIndicesSelection(prev => {
        const { [indexName]: _, ...rest } = prev;
        return rest;
      });
    } else {
      // If the index was modified, revert to the original
      setDisplayIndices(prevIndices => [originalIndex, ...prevIndices.filter(index => index.name !== indexName)]);
      setIndicesSelection(prev => ({ ...prev, [indexName]: true }));
    }

    setChangeLog(prev => {
      const { [indexName]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleRemoveIndex = (indexName: string) => {
    const indexToRemove = displayIndices?.find(index => index.name === indexName);
    if (!indexToRemove) return;

    setDisplayIndices(prevIndices => prevIndices.filter(index => index.name !== indexName));
    setIndicesSelection(prev => {
      const { [indexName]: _, ...rest } = prev;
      return rest;
    });

    setChangeLog(prev => {
      const isNewIndex = !indices.data?.some(index => index.name === indexName);
      if (isNewIndex) {
        const { [indexName]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [indexName]: {
          original: {
            hotDays: indexToRemove.hotRetentionDays,
            coldDays: indexToRemove.coldRetentionDays,
            elasticStorage: indexToRemove.elasticStorageGB,
            s3Storage: indexToRemove.S3StorageGB,
          },
          current: {
            hotDays: 0,
            coldDays: 0,
            elasticStorage: 0,
            s3Storage: 0,
          }
        }
      };
    });
  };

  const displayProps: {
    direction: Direction,
    displayMethod: DisplayMethod,
    translateIndexNames: boolean,
    displayRates: boolean,
    t: Translation
  } = {
    direction,
    t,
    displayMethod: audience === 'user' && config.combineForUser ? 'combined' : 'separate',
    translateIndexNames: audience === 'user',
    displayRates: audience === 'developer'
  }

  return (
    <>
      <StorageDashboardLayout
        header={
          <StorageHeader
            {...displayProps}
            audience={audience}
            setAudience={setAudience}
            clustersMetadata={clustersMetadata}
            selectedClusterMetadata={selectedClusterMetadata}
            setSelectedCluster={handleSetSelectedCluster}
            indices={displayIndices}
            selectedIndices={indicesSelection}
            handleIndexToggle={handleIndexToggle}
            isEditMode={isEditMode}
            handleModeToggle={handleEditModeToggle}
          />
        }
        storageUsage={
          selectedCluster.status === 'loading' || indices.status === 'loading' ? (
            <div className="icon-container"><FaCircleNotch className="loading-icon" /></div>
          ) : selectedCluster.status === 'error' || indices.status === 'error' ? (
            <div className="icon-container"><FaTimesCircle className="error-icon" /></div>
          ) : (
            <StorageUsageOverview
              {...displayProps}
              usedCombinedStorage={usedCombinedStorage}
              combinedStorage={combinedStorage}
              combinedStoragePercentage={combinedStoragePercentage}
              usedElasticStorage={usedElasticStorage}
              totalElasticStorage={totalElasticStorage}
              elasticStoragePercentage={elasticStoragePercentage}
              usedS3Storage={usedS3Storage}
              totalS3Storage={totalS3Storage}
              s3StoragePercentage={s3StoragePercentage}
            />
          )
        }
        chart={
          selectedCluster.status === 'loading' || indices.status === 'loading' ? (
            <div className="icon-container"><FaCircleNotch className="loading-icon" /></div>
          ) : selectedCluster.status === 'error' || indices.status === 'error' ? (
            <div className="icon-container"><FaTimesCircle className="error-icon" /></div>
          ) : (
            <IndexRetentionPeriodsChart
              {...displayProps}
              filteredIndices={filteredIndices}
            />
          )
        }
        retentionManagement={
          selectedCluster.status === 'loading' || indices.status === 'loading' ? (
            <div className="icon-container"><FaCircleNotch className="loading-icon" /></div>
          ) : selectedCluster.status === 'error' || indices.status === 'error' ? (
            <div className="icon-container"><FaTimesCircle className="error-icon" /></div>
          ) : (
            <IndexRetentionManagement
              {...displayProps}
              isEditMode={isEditMode}
              filteredIndices={filteredIndices}
              handleTotalRetentionChange={handleTotalRetentionChange}
              handleIndexRetentionChange={handleIndexRetentionChange}
              handleRemoveIndex={handleRemoveIndex}
              setShowAddIndex={setShowAddIndex}
              showAddIndex={showAddIndex}
            />
          )
        }
        changeLog={
          isEditMode && (
            <ChangeLog
              {...displayProps}
              changeLog={changeLog}
              indices={displayIndices}
              selectedCluster={selectedCluster.data}
              handleRevertChange={handleRevertChange}
              handleResetChanges={handleResetChanges}
              setIndices={setDisplayIndices}
              handleIndexRetentionChange={handleIndexRetentionChange}
              setSelectedIndices={setIndicesSelection}
              setChangeLog={setChangeLog}
            />
          )
        }
        isEditMode={isEditMode}
      />
      {showAddIndex && (
        <GenericModal showModal={showAddIndex} setShowModal={setShowAddIndex}>
          <AddIndexForm
            {...displayProps}
            handleAddIndex={handleAddIndex}
            indices={displayIndices}
            setShowAddIndex={setShowAddIndex}
          />
        </GenericModal>
      )}
    </>
  );
};

export default StorageDashboardPage;