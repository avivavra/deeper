"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Audience, ChangeLogEntry, ClusterData, Direction, DisplayMethod, IndexData, NewIndex, NewIndexInputType, Translation } from './models';
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

const DAILY_SECONDS = 86400;
const GB_TO_BYTES = 1024 * 1024 * 1024;

const emptyNewIndex = (): NewIndex => ({
  name: '',
  docSize: '',
  frequency: '',
  avgDocs: '',
  inputType: 'frequency',
  totalRetention: '',
  coldRetention: '',
  importFromIndex: ''
});

type StorageDashboardPageProps = {
  clustersApi: ClustersApi;
  clusterNames: { name: string; hebrewName: string; }[];
};

const StorageDashboardPage = ({ clustersApi, clusterNames }: StorageDashboardPageProps) => {
  // Original data and main states
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchInitialCluster = useCallback(() =>
    clustersApi.getCluster(clusterNames[0].name),
    [clusterNames, clustersApi]);
  const fetchInitialIndices = useCallback(() =>
    clustersApi.getIndices(clusterNames[0].name),
    [clustersApi, clusterNames[0].name]);

  const [selectedClusterName, setSelectedClusterName] = useState<{ name: string; hebrewName: string }>(clusterNames[0]);

  const { state: selectedCluster, fetchData: setSelectedCluster } = useAsyncState<ClusterData>(fetchInitialCluster);

  const { state: originalIndices, fetchData: setOriginalIndices } = useAsyncState<IndexData[]>([]);

  const [indices, setIndices] = useState<IndexData[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<{ [key: string]: boolean }>({});
  const [changeLog, setChangeLog] = useState<{ [key: string]: ChangeLogEntry }>({});
  const [totalElasticStorage, setTotalElasticStorage] = useState(0); // GB
  const [totalS3Storage, setTotalS3Storage] = useState(0); // GB
  const [showAddIndex, setShowAddIndex] = useState(false);
  const [newIndex, setNewIndex] = useState<NewIndex>(emptyNewIndex());
  const [audience, setAudience] = useState<Audience>(config.defaultMode as Audience);

  const t = translations[audience === 'user' ? 'hebrew' : 'english'];
  const direction: Direction = audience === 'user' ? 'rtl' : 'ltr';

  const handleResetChanges = () => {
    if (originalIndices.status === 'succeeded' && originalIndices.data) {
      setIndices(originalIndices.data);
      setChangeLog({});
      setSelectedIndices(originalIndices.data.reduce((acc, index) => ({ ...acc, [index.name]: true }), {}));
    }
  };

  useEffect(() => {
    setOriginalIndices(() => clustersApi.getIndices(selectedClusterName.name));
  }, [setOriginalIndices, clustersApi, selectedClusterName.name]);

  useEffect(() => {
    if (selectedCluster.status === 'succeeded') {
      setTotalElasticStorage(selectedCluster.data.totalElasticStorage);
      setTotalS3Storage(selectedCluster.data.totalS3Storage);
    }
    if (originalIndices.status === 'succeeded') {
      const indicesData = originalIndices.data;
      setIndices(indicesData);
      setSelectedIndices(indicesData.reduce((acc, index) => ({ ...acc, [index.name]: true }), {}));
    }

    handleResetChanges();
  }, [originalIndices, selectedCluster]);

  useEffect(() => {
    document.documentElement.dir = direction;
  }, [audience]);

  const handleEditModeToggle = () => {
    if (isEditMode) {
      handleResetChanges();
    }
    setIsEditMode(!isEditMode);
  };

  const handleSetSelectedCluster = useCallback((clusterName: string) => {
    const cluster = clusterNames.find(c => c.name === clusterName);
    if (cluster) {
      setSelectedClusterName(cluster);
      setSelectedCluster(() => clustersApi.getCluster(clusterName));
    }
  }, [clustersApi, clusterNames, setSelectedCluster]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        setAudience(prev => (prev === 'developer' ? 'user' : 'developer'));
      }
      if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        handleEditModeToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const digits = 2;
  const usedElasticStorage = indices ? parseFloat(indices.reduce((acc, curr) => acc + curr.elasticStorageGB, 0).toFixed(digits)) : 0;
  const usedS3Storage = indices ? parseFloat(indices.reduce((acc, curr) => acc + curr.S3StorageGB, 0).toFixed(digits)) : 0;
  const elasticStoragePercentage = totalElasticStorage ? parseFloat(((usedElasticStorage / totalElasticStorage) * 100).toFixed(digits)) : 0;
  const s3StoragePercentage = totalS3Storage ? parseFloat(((usedS3Storage / totalS3Storage) * 100).toFixed(digits)) : 0;
  const usedCombinedStorage = parseFloat((usedElasticStorage + usedS3Storage).toFixed(digits));

  const combinedStorage = totalElasticStorage + totalS3Storage;
  const combinedStoragePercentage = combinedStorage ? parseFloat(((usedCombinedStorage / combinedStorage) * 100).toFixed(digits)) : 0;

  const filteredIndices = indices ? indices.filter(index => selectedIndices[index.name]) : [];

  const calculateRates = (docSize: number, frequency: number, avgDocs: number, inputType: NewIndexInputType) => {
    const dailyData = inputType === 'frequency'
      ? (docSize * frequency * DAILY_SECONDS) / GB_TO_BYTES
      : (docSize * avgDocs) / GB_TO_BYTES;
    return {
      elasticStoragePerHotTierDay: dailyData,
      S3StoragePerColdTierDay: dailyData * config.hotTierMultiplier,
      elasticStoragePerColdTierDay: dailyData * config.coldTierMultiplier
    };
  };

  const handleAddIndex = () => {
    let rates;
    if (newIndex.inputType === 'import') {
      const selectedIndex = indices?.find(index => index.name === newIndex.importFromIndex);
      if (selectedIndex) {
        rates = {
          elasticStoragePerHotTierDay: selectedIndex.elasticStoragePerHotTierDay,
          S3StoragePerColdTierDay: selectedIndex.S3StoragePerColdTierDay,
          elasticStoragePerColdTierDay: selectedIndex.elasticStoragePerColdTierDay
        };
      } else {
        throw new Error(`selected index to import from ${newIndex.importFromIndex} not found`);
      }
    } else {
      rates = calculateRates(Number(newIndex.docSize), Number(newIndex.frequency), Number(newIndex.avgDocs), newIndex.inputType);
    }

    const hotRetentionDays = Number(newIndex.totalRetention) - Number(newIndex.coldRetention);
    const coldRetentionDays = Number(newIndex.coldRetention);

    const newIndexData = {
      name: newIndex.name,
      hebrewName: newIndex.name,
      elasticStoragePerHotTierDay: parseFloat(rates.elasticStoragePerHotTierDay.toFixed(2)),
      S3StoragePerColdTierDay: parseFloat(rates.S3StoragePerColdTierDay.toFixed(2)),
      elasticStoragePerColdTierDay: parseFloat(rates.elasticStoragePerColdTierDay.toFixed(2)),
      hotRetentionDays,
      coldRetentionDays,
      elasticStorageGB: parseFloat((rates.elasticStoragePerHotTierDay * hotRetentionDays).toFixed(2)),
      S3StorageGB: parseFloat((rates.S3StoragePerColdTierDay * coldRetentionDays).toFixed(2)),
      totalRetentionDays: hotRetentionDays + coldRetentionDays,
      initialHotRetentionDays: hotRetentionDays,
      initialColdRetentionDays: coldRetentionDays
    };

    setIndices([newIndexData, ...indices]);
    setSelectedIndices(prev => ({ ...prev, [newIndex.name]: true }));
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
          hotDays: hotRetentionDays,
          coldDays: coldRetentionDays,
          elasticStorage: newIndexData.elasticStorageGB,
          s3Storage: newIndexData.S3StorageGB,
        }
      }
    }));
    setNewIndex(emptyNewIndex());
    setShowAddIndex(false);
  };

  const handleIndexToggle = (indexName: string) => {
    setSelectedIndices(prev => ({
      ...prev,
      [indexName]: !prev[indexName]
    }));
  };

  const handleIndexRetentionChange = (indexName: string, newHotDays: number, newColdDays: number) => {
    setIndices(prevIndices => {
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
      const originalIndex = originalIndices.data?.find(i => i.name === indexName);

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
    setIndices(prevIndices => {
      const newIndices = prevIndices.map(index => {
        if (index.name === indexName) {
          const originalIndex = originalIndices.data?.find(i => i.name === indexName);

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
      const originalIndex = originalIndices.data?.find(i => i.name === indexName);

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
    const originalIndex = originalIndices.data?.find(i => i.name === indexName);
    if (!originalIndex) {
      // If the index was newly added, remove it
      setIndices(prevIndices => prevIndices.filter(index => index.name !== indexName));
      setSelectedIndices(prev => {
        const { [indexName]: _, ...rest } = prev;
        return rest;
      });
    } else {
      // If the index was modified, revert to the original
      setIndices(prevIndices => [originalIndex, ...prevIndices.filter(index => index.name !== indexName)]);
      setSelectedIndices(prev => ({ ...prev, [indexName]: true }));
    }

    setChangeLog(prev => {
      const { [indexName]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleRemoveIndex = (indexName: string) => {
    const indexToRemove = indices?.find(index => index.name === indexName);
    if (!indexToRemove) return;

    setIndices(prevIndices => prevIndices.filter(index => index.name !== indexName));
    setSelectedIndices(prev => {
      const { [indexName]: _, ...rest } = prev;
      return rest;
    });

    setChangeLog(prev => {
      const isNewIndex = !originalIndices.data?.some(index => index.name === indexName);
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
            clusters={clusterNames}
            selectedCluster={selectedClusterName}
            setSelectedCluster={handleSetSelectedCluster}
            indices={indices}
            selectedIndices={selectedIndices}
            handleIndexToggle={handleIndexToggle}
            isEditMode={isEditMode}
            handleModeToggle={handleEditModeToggle}
          />
        }
        storageUsage={
          selectedCluster.status === 'loading' || originalIndices.status === 'loading' ? (
            <div className="icon-container"><FaCircleNotch className="loading-icon" /></div>
          ) : selectedCluster.status === 'error' || originalIndices.status === 'error' ? (
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
          selectedCluster.status === 'loading' || originalIndices.status === 'loading' ? (
            <div className="icon-container"><FaCircleNotch className="loading-icon" /></div>
          ) : selectedCluster.status === 'error' || originalIndices.status === 'error' ? (
            <div className="icon-container"><FaTimesCircle className="error-icon" /></div>
          ) : (
            <IndexRetentionPeriodsChart
              {...displayProps}
              filteredIndices={filteredIndices}
            />
          )
        }
        retentionManagement={
          selectedCluster.status === 'loading' || originalIndices.status === 'loading' ? (
            <div className="icon-container"><FaCircleNotch className="loading-icon" /></div>
          ) : selectedCluster.status === 'error' || originalIndices.status === 'error' ? (
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
              newIndex={newIndex}
              setNewIndex={setNewIndex}
              handleAddIndex={handleAddIndex}
            />
          )
        }
        changeLog={
          isEditMode && (
            <ChangeLog
              {...displayProps}
              changeLog={changeLog}
              indices={indices}
              selectedCluster={selectedCluster.data}
              handleRevertChange={handleRevertChange}
              handleResetChanges={handleResetChanges}
              setIndices={setIndices}
              handleIndexRetentionChange={handleIndexRetentionChange}
              setSelectedIndices={setSelectedIndices}
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
            newIndex={newIndex}
            setNewIndex={setNewIndex}
            handleAddIndex={handleAddIndex}
            indices={indices}
            setShowAddIndex={setShowAddIndex}
          />
        </GenericModal>
      )}
    </>
  );
};

export default StorageDashboardPage;