"use client";

import React, { useState, useEffect } from 'react';
import { ClusterMetadata, IndexData, Audience, ChangeLogEntry, Direction, Translation, SourceData } from './models';
import { ChangeLog, useChangeLog, StorageHeader, StorageUsageOverview, IndexRetentionPeriodsChart, IndexRetentionManagement, AddIndexForm } from './sub-components';
import { GenericModal } from '../../components';
import { ClusterSummarizerFactory } from '../../../api';
import { StorageDashboardLayout } from './StorageDashboardLayout';
import { FaCircleNotch, FaTimesCircle } from 'react-icons/fa';
import { useAudience, useEditMode, useCluster } from './hooks';

import './StorageDashboardPage.css';

const calculateStorageDiffs = (changeLog: ChangeLogEntry[]) => {
  let elasticStorageDiff = 0;
  let s3StorageDiff = 0;

  changeLog.forEach(entry => {
    elasticStorageDiff += (entry.current.elasticStorage - entry.original.elasticStorage);
    s3StorageDiff += (entry.current.s3Storage - entry.original.s3Storage);
  });

  return { elasticStorageDiff, s3StorageDiff };
};

type StorageDashboardPageProps = {
  clustersSummarizerFactory: ClusterSummarizerFactory;
  clustersMetadata: ClusterMetadata[];
  defaultMode: Audience;
};

export const StorageDashboardPage = ({ clustersSummarizerFactory, clustersMetadata, defaultMode }: StorageDashboardPageProps) => {
  const { audience, setAudience, direction, t } = useAudience(defaultMode);
  const { isEditMode, handleEditModeToggle } = useEditMode();
  const { selectedClusterMetadata, selectedCluster, handleSetSelectedCluster, indices, totalElasticStorage, totalS3Storage } = useCluster(clustersSummarizerFactory, clustersMetadata);

  const [displayIndices, setDisplayIndices] = useState<IndexData[]>([]);
  const [indicesSelection, setIndicesSelection] = useState<{ [key: string]: boolean }>({});
  const { changeLog, getChangeLogEntry, emptyChangeLog, addChangeLogEntry, updateChangeLogEntry, removeChangeLogEntry } = useChangeLog();
  const [showAddIndex, setShowAddIndex] = useState(false);
  const [sources, setSources] = useState<SourceData[]>([]);

  const handleResetChanges = () => {
    if (indices.status === 'succeeded' && indices.data) {
      setDisplayIndices(indices.data);
      setIndicesSelection(indices.data.reduce((acc, index) => ({ ...acc, [index.name]: true }), {}));
      setSources([]);
      emptyChangeLog();
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

  useEffect(() => {
    if (!isEditMode) {
      handleResetChanges();
    }
  }, [isEditMode]);

  const { elasticStorageDiff, s3StorageDiff } = calculateStorageDiffs(changeLog);

  const usedElasticStorage = (selectedCluster?.data?.usedElasticStorage || 0) + elasticStorageDiff;
  const usedS3Storage = (selectedCluster?.data?.usedS3Storage || 0) + s3StorageDiff;

  const elasticStoragePercentage = totalElasticStorage ? (usedElasticStorage / totalElasticStorage) * 100 : 0;
  const s3StoragePercentage = totalS3Storage ? (usedS3Storage / totalS3Storage) * 100 : 0;

  const filteredIndices = displayIndices ? displayIndices.filter(index => indicesSelection[index.name]) : [];

  const handleAddIndex = (newIndex: IndexData) => {
    setDisplayIndices([newIndex, ...displayIndices]);
    setIndicesSelection(prev => ({ ...prev, [newIndex.name]: true }));
    addChangeLogEntry({
      type: 'index',
      name: newIndex.name,
      original: {
        hotDays: 0,
        coldDays: 0,
        elasticStorage: 0,
        s3Storage: 0,
      },
      current: {
        hotDays: newIndex.hotRetentionDays,
        coldDays: newIndex.coldRetentionDays,
        elasticStorage: newIndex.elasticStorage,
        s3Storage: newIndex.S3Storage,
      }
    });
  };

  const handleNewIndexSubmitted = (newIndex: IndexData) => {
    handleAddIndex(newIndex);
    setShowAddIndex(false);
  };

  const handleAddSource = (newSource: SourceData) => {
    setSources(prevSources => [newSource, ...prevSources]);
    addChangeLogEntry({
      type: 'source',
      name: newSource.name,
      relatedIndex: newSource.relatedIndex,
      original: {
        elasticStorage: 0,
        s3Storage: 0,
      },
      current: {
        elasticStorage: newSource.elasticStorage,
        s3Storage: newSource.S3Storage,
      }
    });
  };

  const handleIndexToggle = (indexName: string) => {
    setIndicesSelection(prev => ({
      ...prev,
      [indexName]: !prev[indexName]
    }));
  };

  const handleIndexRetentionChange = (indexName: string, newHotDays: number, newColdDays: number, newElasticStorage: number, newS3Storage: number) => {
    setDisplayIndices(prevIndices => {
      const updatedIndices = prevIndices.map(index => {
        if (index.name === indexName) {
          return {
            ...index,
            hotRetentionDays: newHotDays,
            coldRetentionDays: newColdDays,
            totalRetentionDays: newHotDays + newColdDays,
            elasticStorage: newElasticStorage,
            S3Storage: newS3Storage
          };
        }
        return index;
      });

      const updatedIndex = updatedIndices.find(i => i.name === indexName) as IndexData;
      const originalIndex = indices.data?.find(i => i.name === indexName);

      updateChangeLogEntry(indexName, {
        type: 'index',
        name: indexName,
        original: {
          hotDays: originalIndex ? originalIndex.hotRetentionDays : 0,
          coldDays: originalIndex ? originalIndex.coldRetentionDays : 0,
          elasticStorage: originalIndex ? originalIndex.elasticStorage : 0,
          s3Storage: originalIndex ? originalIndex.S3Storage : 0,
        },
        current: {
          hotDays: newHotDays,
          coldDays: newColdDays,
          elasticStorage: updatedIndex.elasticStorage,
          s3Storage: updatedIndex.S3Storage,
        }
      });

      return updatedIndices;
    });

    // Update related sources
    setSources(prevSources => prevSources.map(source => {
      if (source.relatedIndex === indexName) {
        const newElasticStorage = newHotDays * source.elasticStoragePerHotTierDay + newColdDays * source.elasticStoragePerColdTierDay;
        const newS3Storage = newColdDays * source.S3StoragePerColdTierDay;

        return {
          ...source,
          elasticStorage: newElasticStorage,
          S3Storage: newS3Storage
        };
      }
      return source;
    }));

    sources.forEach(source => {
      if (source.relatedIndex === indexName) {
        const newElasticStorage = newHotDays * source.elasticStoragePerHotTierDay + newColdDays * source.elasticStoragePerColdTierDay;
        const newS3Storage = newColdDays * source.S3StoragePerColdTierDay;

        const change = getChangeLogEntry(source.name);

        updateChangeLogEntry(source.name, {
          type: 'source',
          name: source.name,
          relatedIndex: source.relatedIndex,
          original: {
            elasticStorage: change?.original.elasticStorage || 0,
            s3Storage: change?.original.s3Storage || 0,
          },
          current: {
            elasticStorage: newElasticStorage,
            s3Storage: newS3Storage,
          }
        });
      }
    });
  };

  const handleRevertIndexChange = (indexName: string) => {
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

    removeChangeLogEntry(indexName);
  };

  const handleRemoveIndex = (indexName: string) => {
    const originalIndex = indices.data?.find(i => i.name === indexName);
    setDisplayIndices(prevIndices => prevIndices.filter(index => index.name !== indexName));
    setIndicesSelection(prev => {
      const { [indexName]: _, ...rest } = prev;
      return rest;
    });
    updateChangeLogEntry(indexName, {
      type: 'index',
      name: indexName,
      original: {
        hotDays: originalIndex ? originalIndex.hotRetentionDays : 0,
        coldDays: originalIndex ? originalIndex.coldRetentionDays : 0,
        elasticStorage: originalIndex ? originalIndex.elasticStorage : 0,
        s3Storage: originalIndex ? originalIndex.S3Storage : 0,
      },
      current: {
        hotDays: 0,
        coldDays: 0,
        elasticStorage: 0,
        s3Storage: 0,
      }
    });
  };

  const handleAddNewIndex = (indexName: string, newHotDays: number, newColdDays: number, newElasticStorage: number, newS3Storage: number) => {
    const elasticStoragePerHotTierDay = newHotDays > 0 ? newElasticStorage / newHotDays : 0;
    const S3StoragePerColdTierDay = newColdDays > 0 ? newS3Storage / newColdDays : 0;

    const newIndexData = {
      name: indexName,
      hebrewName: indexName,
      hotRetentionDays: newHotDays,
      coldRetentionDays: newColdDays,
      elasticStorage: newElasticStorage || 0,
      S3Storage: newS3Storage || 0,
      totalRetentionDays: newHotDays + newColdDays,
      initialHotRetentionDays: newHotDays,
      initialColdRetentionDays: newColdDays,
      elasticStoragePerHotTierDay: elasticStoragePerHotTierDay,
      S3StoragePerColdTierDay: S3StoragePerColdTierDay,
      elasticStoragePerColdTierDay: 0,
      indexNamesByTier: { hotTier: [], coldTier: [] }
    };

    handleAddIndex(newIndexData);
  };

  const handleSourceChange = (sourceName: string, newElasticStorage: number, newS3Storage: number) => {
    if (newElasticStorage == 0 || newS3Storage == 0) {
      setSources(prevSources => (
        prevSources.filter(source => source.name !== sourceName)
      ));
      removeChangeLogEntry(sourceName);
    } else {
      setSources(prevSources => {
        const updatedSources = prevSources.map(source => {
          if (source.name === sourceName) {
            return {
              ...source,
              elasticStorage: newElasticStorage,
              S3Storage: newS3Storage
            };
          }
          return source;
        });

        const updatedSource = updatedSources.find(s => s.name === sourceName) as SourceData;
        const originalSource = sources.find(s => s.name === sourceName);

        updateChangeLogEntry(sourceName, {
          type: 'source',
          name: sourceName,
          relatedIndex: updatedSource.relatedIndex,
          original: {
            elasticStorage: originalSource ? originalSource.elasticStorage : 0,
            s3Storage: originalSource ? originalSource.S3Storage : 0,
          },
          current: {
            elasticStorage: updatedSource.elasticStorage,
            s3Storage: updatedSource.S3Storage,
          }
        });

        return updatedSources;
      });
    }
  };

  const displayProps: {
    direction: Direction,
    translateIndexNames: boolean,
    displayRates: boolean,
    t: Translation
  } = {
    direction,
    t,
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
              handleIndexRetentionChange={handleIndexRetentionChange}
              handleRemoveIndex={handleRemoveIndex}
              setShowAddIndex={setShowAddIndex}
              showAddIndex={showAddIndex}
              sources={sources}
              handleAddSource={handleAddSource}
            />
          )
        }
        changeLog={
          isEditMode && (
            <ChangeLog
              {...displayProps}
              changeLog={changeLog}
              indices={displayIndices}
              handleRevertIndexChange={handleRevertIndexChange}
              handleResetChanges={handleResetChanges}
              handleIndexRetentionChange={handleIndexRetentionChange}
              handleSourceChange={handleSourceChange}
              handleRemoveIndex={handleRemoveIndex}
              handleAddNewIndex={handleAddNewIndex}
            />
          )
        }
        isEditMode={isEditMode}
      />
      {showAddIndex && (
        <GenericModal showModal={showAddIndex} setShowModal={setShowAddIndex}>
          <AddIndexForm
            {...displayProps}
            handleAddIndex={handleNewIndexSubmitted}
            indices={displayIndices}
            setShowAddIndex={setShowAddIndex}
          />
        </GenericModal>
      )}
    </>
  );
};
