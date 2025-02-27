"use client";

import React, { useState, useEffect } from 'react';
import { ClusterMetadata, SourceGroup, Audience, ChangeLogEntry, Direction, Translation, Source } from './models';
import { ChangeLog, useChangeLog, StorageHeader, StorageUsageOverview, ComparisonChart, RetentionManagement, AddSourceGroupForm } from './sub-components';
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
  const { selectedClusterMetadata, selectedCluster, handleSetSelectedCluster, sourceGroups, totalElasticStorage, totalS3Storage } = useCluster(clustersSummarizerFactory, clustersMetadata);

  const [displaySourceGroups, setDisplaySourceGroups] = useState<SourceGroup[]>([]);
  const [sourceGroupsSelection, setSourceGroupsSelection] = useState<{ [key: string]: boolean }>({});
  const { changeLog, getChangeLogEntry, emptyChangeLog, addChangeLogEntry, updateChangeLogEntry, removeChangeLogEntry } = useChangeLog();
  const [showAddSourceGroup, setShowAddSourceGroup] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);

  const handleResetChanges = () => {
    if (sourceGroups.status === 'succeeded' && sourceGroups.data) {
      setDisplaySourceGroups(sourceGroups.data);
      setSourceGroupsSelection(sourceGroups.data.reduce((acc, sourceGroup) => ({ ...acc, [sourceGroup.name]: true }), {}));
      setSources([]);
      emptyChangeLog();
    }
  };

  useEffect(() => {
    if (sourceGroups.status === 'succeeded') {
      const sourceGroupsData = sourceGroups.data;
      setDisplaySourceGroups(sourceGroupsData);
      setSourceGroupsSelection(sourceGroupsData.reduce((acc, sourceGroup) => ({ ...acc, [sourceGroup.name]: true }), {}));
    }

    handleResetChanges();
  }, [sourceGroups]);

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

  const filteredSourceGroups = displaySourceGroups ? displaySourceGroups.filter(sourceGroup => sourceGroupsSelection[sourceGroup.name]) : [];

  const handleAddSourceGroup = (newSourceGroup: SourceGroup) => {
    setDisplaySourceGroups([newSourceGroup, ...displaySourceGroups]);
    setSourceGroupsSelection(prev => ({ ...prev, [newSourceGroup.name]: true }));
    addChangeLogEntry({
      type: 'sourceGroup',
      name: newSourceGroup.name,
      original: {
        hotDays: 0,
        coldDays: 0,
        elasticStorage: 0,
        s3Storage: 0,
      },
      current: {
        hotDays: newSourceGroup.hotRetentionDays,
        coldDays: newSourceGroup.coldRetentionDays,
        elasticStorage: newSourceGroup.elasticStorage,
        s3Storage: newSourceGroup.S3Storage,
      }
    });
  };

  const handleNewSourceGroupSubmitted = (newSourceGroup: SourceGroup) => {
    handleAddSourceGroup(newSourceGroup);
    setShowAddSourceGroup(false);
  };

  const handleAddSource = (newSource: Source) => {
    setSources(prevSources => [newSource, ...prevSources]);
    addChangeLogEntry({
      type: 'source',
      name: newSource.name,
      relatedSourceGroup: newSource.relatedSourceGroup,
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

  const handleSourceGroupToggle = (sourceGroupName: string) => {
    setSourceGroupsSelection(prev => ({
      ...prev,
      [sourceGroupName]: !prev[sourceGroupName]
    }));
  };

  const handleSourceGroupRetentionChange = (name: string, newHotDays: number, newColdDays: number, newElasticStorage: number, newS3Storage: number) => {
    setDisplaySourceGroups(prevSourceGroups => {
      const updatedSourceGroups = prevSourceGroups.map(sourceGroup => {
        if (sourceGroup.name === name) {
          return {
            ...sourceGroup,
            hotRetentionDays: newHotDays,
            coldRetentionDays: newColdDays,
            totalRetentionDays: newHotDays + newColdDays,
            elasticStorage: newElasticStorage,
            S3Storage: newS3Storage
          };
        }
        return sourceGroup;
      });

      const updatedSourceGroup = updatedSourceGroups.find(i => i.name === name) as SourceGroup;
      const originalSourceGroup = sourceGroups.data?.find(i => i.name === name);

      updateChangeLogEntry(name, {
        type: 'sourceGroup',
        name: name,
        original: {
          hotDays: originalSourceGroup ? originalSourceGroup.hotRetentionDays : 0,
          coldDays: originalSourceGroup ? originalSourceGroup.coldRetentionDays : 0,
          elasticStorage: originalSourceGroup ? originalSourceGroup.elasticStorage : 0,
          s3Storage: originalSourceGroup ? originalSourceGroup.S3Storage : 0,
        },
        current: {
          hotDays: newHotDays,
          coldDays: newColdDays,
          elasticStorage: updatedSourceGroup.elasticStorage,
          s3Storage: updatedSourceGroup.S3Storage,
        }
      });

      return updatedSourceGroups;
    });

    // Update related sources
    setSources(prevSources => prevSources.map(source => {
      if (source.relatedSourceGroup === name) {
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
      if (source.relatedSourceGroup === name) {
        const newElasticStorage = newHotDays * source.elasticStoragePerHotTierDay + newColdDays * source.elasticStoragePerColdTierDay;
        const newS3Storage = newColdDays * source.S3StoragePerColdTierDay;

        const change = getChangeLogEntry(source.name);

        updateChangeLogEntry(source.name, {
          type: 'source',
          name: source.name,
          relatedSourceGroup: source.relatedSourceGroup,
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

  const handleRevertSourceGroupChange = (name: string) => {
    const originalSourceGroup = sourceGroups.data?.find(i => i.name === name);
    if (!originalSourceGroup) {
      // If the source group was newly added, remove it
      setDisplaySourceGroups(prevSourceGroups => prevSourceGroups.filter(sourceGroup => sourceGroup.name !== name));
      setSourceGroupsSelection(prev => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    } else {
      // If the source group was modified, revert to the original
      setDisplaySourceGroups(prevSourceGroups => [originalSourceGroup, ...prevSourceGroups.filter(sourceGroup => sourceGroup.name !== name)]);
      setSourceGroupsSelection(prev => ({ ...prev, [name]: true }));
    }

    removeChangeLogEntry(name);
  };

  const handleRemoveSourceGroup = (name: string) => {
    const originalSourceGroup = sourceGroups.data?.find(i => i.name === name);
    setDisplaySourceGroups(prevSourceGroups => prevSourceGroups.filter(sourceGroup => sourceGroup.name !== name));
    setSourceGroupsSelection(prev => {
      const { [name]: _, ...rest } = prev;
      return rest;
    });
    updateChangeLogEntry(name, {
      type: 'sourceGroup',
      name: name,
      original: {
        hotDays: originalSourceGroup ? originalSourceGroup.hotRetentionDays : 0,
        coldDays: originalSourceGroup ? originalSourceGroup.coldRetentionDays : 0,
        elasticStorage: originalSourceGroup ? originalSourceGroup.elasticStorage : 0,
        s3Storage: originalSourceGroup ? originalSourceGroup.S3Storage : 0,
      },
      current: {
        hotDays: 0,
        coldDays: 0,
        elasticStorage: 0,
        s3Storage: 0,
      }
    });
  };

  const handleAddNewSourceGroup = (name: string, newHotDays: number, newColdDays: number, newElasticStorage: number, newS3Storage: number) => {
    const elasticStoragePerHotTierDay = newHotDays > 0 ? newElasticStorage / newHotDays : 0;
    const S3StoragePerColdTierDay = newColdDays > 0 ? newS3Storage / newColdDays : 0;

    const newSourceGroupData = {
      name: name,
      hebrewName: name,
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

    handleAddSourceGroup(newSourceGroupData);
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

        const updatedSource = updatedSources.find(s => s.name === sourceName) as Source;
        const originalSource = sources.find(s => s.name === sourceName);

        updateChangeLogEntry(sourceName, {
          type: 'source',
          name: sourceName,
          relatedSourceGroup: updatedSource.relatedSourceGroup,
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

  const handleRemoveSource = (sourceName: string) => {
    setSources(prevSources => prevSources.filter(source => source.name !== sourceName));
    removeChangeLogEntry(sourceName);
  };

  const displayProps: {
    direction: Direction,
    translateNames: boolean,
    displayRates: boolean,
    t: Translation
  } = {
    direction,
    t,
    translateNames: audience === 'user',
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
            sourceGroups={displaySourceGroups}
            selectedSourceGroups={sourceGroupsSelection}
            handleSourceGroupToggle={handleSourceGroupToggle}
            isEditMode={isEditMode}
            handleModeToggle={handleEditModeToggle}
          />
        }
        storageUsage={
          selectedCluster.status === 'loading' || sourceGroups.status === 'loading' ? (
            <div className="icon-container"><FaCircleNotch className="loading-icon" /></div>
          ) : selectedCluster.status === 'error' || sourceGroups.status === 'error' ? (
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
          selectedCluster.status === 'loading' || sourceGroups.status === 'loading' ? (
            <div className="icon-container"><FaCircleNotch className="loading-icon" /></div>
          ) : selectedCluster.status === 'error' || sourceGroups.status === 'error' ? (
            <div className="icon-container"><FaTimesCircle className="error-icon" /></div>
          ) : (
            <ComparisonChart
              {...displayProps}
              filteredSourceGroups={filteredSourceGroups}
            />
          )
        }
        retentionManagement={
          selectedCluster.status === 'loading' || sourceGroups.status === 'loading' ? (
            <div className="icon-container"><FaCircleNotch className="loading-icon" /></div>
          ) : selectedCluster.status === 'error' || sourceGroups.status === 'error' ? (
            <div className="icon-container"><FaTimesCircle className="error-icon" /></div>
          ) : (
            <RetentionManagement
              {...displayProps}
              isEditMode={isEditMode}
              filteredSourceGroups={filteredSourceGroups}
              handleSourceGroupRetentionChange={handleSourceGroupRetentionChange}
              handleRemoveSourceGroup={handleRemoveSourceGroup}
              setShowAddSourceGroup={setShowAddSourceGroup}
              sources={sources}
              handleAddSource={handleAddSource}
              handleRemoveSource={handleRemoveSource}
            />
          )
        }
        changeLog={
          isEditMode && (
            <ChangeLog
              {...displayProps}
              changeLog={changeLog}
              sourceGroups={displaySourceGroups}
              handleRevertSourceGroupChange={handleRevertSourceGroupChange}
              handleResetChanges={handleResetChanges}
              handleSourceGroupRetentionChange={handleSourceGroupRetentionChange}
              handleSourceChange={handleSourceChange}
              handleRemoveSourceGroup={handleRemoveSourceGroup}
              handleAddNewSourceGroup={handleAddNewSourceGroup}
            />
          )
        }
        isEditMode={isEditMode}
      />
      {showAddSourceGroup && (
        <GenericModal showModal={showAddSourceGroup} setShowModal={setShowAddSourceGroup}>
          <AddSourceGroupForm
            {...displayProps}
            handleAddSourceGroup={handleNewSourceGroupSubmitted}
            sourceGroups={displaySourceGroups}
            setShowAddSourceGroup={setShowAddSourceGroup}
          />
        </GenericModal>
      )}
    </>
  );
};
