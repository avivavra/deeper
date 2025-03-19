import React, { useState, useEffect } from 'react';
import { ClusterMetadata, SourceGroup, Audience, Direction, Translation, Source } from './models';
import { ChangeLog, useChangeLog, StorageHeader, StorageUsageOverview, ComparisonChart, RetentionManagement, AddSourceGroupForm } from './sub-components';
import { GenericModal } from '../../components';
import { ClusterSummarizerFactory } from '../../../api';
import { StorageDashboardLayout } from './StorageDashboardLayout';
import { FaCircleNotch, FaTimesCircle } from 'react-icons/fa';
import { useAudience, useSimulation, useCluster } from './hooks';
import { useSearchParams, useNavigate } from 'react-router-dom';

import './StorageDashboardPage.css';

type StorageDashboardPageProps = {
  clustersSummarizerFactory: ClusterSummarizerFactory;
  clustersMetadata: ClusterMetadata[];
  defaultMode: Audience;
};

export const StorageDashboardPage = ({ clustersSummarizerFactory, clustersMetadata, defaultMode }: StorageDashboardPageProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const audienceParam = searchParams.get('audience') || 'user';
  const selectedClusterParam = searchParams.get('cluster') || clustersMetadata[0]?.name;

  const { audience, setAudience: setAudienceState, direction, t } = useAudience(audienceParam as Audience);
  const { isInSimulation, handleSimulationToggle } = useSimulation();
  const { selectedClusterMetadata, selectedCluster, handleSetSelectedCluster: setSelectedClusterState, sourceGroups, totalElasticStorage, totalS3Storage } = useCluster(clustersSummarizerFactory, clustersMetadata);

  const setAudience = (newAudience: Audience) => {
    setAudienceState(newAudience);
    setSearchParams({ ...Object.fromEntries(searchParams), audience: newAudience });
  };

  const handleSetSelectedCluster = (clusterName: string) => {
    setSelectedClusterState(clusterName);
    setSearchParams({ ...Object.fromEntries(searchParams), cluster: clusterName });
  };

  useEffect(() => {
    if (!clustersMetadata.find(cluster => cluster.name === selectedClusterParam)) {
      navigate(`?audience=${audienceParam}&cluster=${clustersMetadata[0]?.name}`);
    }
  }, [clustersMetadata, selectedClusterParam, audienceParam, navigate]);

  const [displaySourceGroups, setDisplaySourceGroups] = useState<SourceGroup[]>([]);
  const [sourceGroupsSelection, setSourceGroupsSelection] = useState<{ [key: string]: boolean }>({});
  const { changeLog, getChangeLogEntry, emptyChangeLog, addChangeLogEntry, updateChangeLogEntry, removeChangeLogEntry, elasticStorageDiff, s3StorageDiff } = useChangeLog();
  const [showAddSourceGroup, setShowAddSourceGroup] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [showExitSimulationModal, setShowExitSimulationModal] = useState(false);
  const [pendingSimulationToggle, setPendingSimulationToggle] = useState(false);

  const handleSimulationToggleWithConfirmation = () => {
    if (isInSimulation && changeLog.length > 0) {
      setShowExitSimulationModal(true);
    } else {
      handleSimulationToggle();
    }
  };

  const confirmExitSimulation = () => {
    setShowExitSimulationModal(false);
    handleSimulationToggle();
  };

  const cancelExitSimulation = () => {
    setShowExitSimulationModal(false);
    setPendingSimulationToggle(false);
  };

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
    if (!isInSimulation) {
      handleResetChanges();
    }
  }, [isInSimulation]);

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
        elasticStoragePerHotTierDay: newSource.elasticStoragePerHotTierDay,
        elasticStoragePerColdTierDay: newSource.elasticStoragePerColdTierDay,
        S3StoragePerColdTierDay: newSource.S3StoragePerColdTierDay
      }
    });
  };

  const handleSourceGroupToggle = (name: string) => {
    setSourceGroupsSelection(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleSourceGroupRetentionChange = (name: string, newHotDays: number, newColdDays: number, newElasticStorage: number, newS3Storage: number) => {
    setDisplaySourceGroups(prevSourceGroups => {
      const updatedSourceGroups = prevSourceGroups.map(sourceGroup => {
        if (sourceGroup.name === name) {
          const newElasticStorage = newHotDays * sourceGroup.elasticStoragePerHotTierDay + newColdDays * sourceGroup.elasticStoragePerColdTierDay;
          const newS3Storage = newColdDays * sourceGroup.S3StoragePerColdTierDay;
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

      const updatedSourceGroup = updatedSourceGroups.find(sourceGroup => sourceGroup.name === name) as SourceGroup;
      const originalSourceGroup = sourceGroups.data?.find(sourceGroup => sourceGroup.name === name);

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
            elasticStoragePerHotTierDay: source.elasticStoragePerHotTierDay,
            elasticStoragePerColdTierDay: source.elasticStoragePerColdTierDay,
            S3StoragePerColdTierDay: source.S3StoragePerColdTierDay,
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
            elasticStoragePerHotTierDay: updatedSource.elasticStoragePerHotTierDay,
            elasticStoragePerColdTierDay: updatedSource.elasticStoragePerColdTierDay,
            S3StoragePerColdTierDay: updatedSource.S3StoragePerColdTierDay,
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

  const handleNewSource = (sourceName: string, relatedSourceGroup: string, elasticStoragePerHotTierDay: number, elasticStoragePerColdTierDay: number, S3StoragePerColdTierDay: number) => {
    const relatedSourceGroupObject = sourceGroups.data?.find(sourceGroup => sourceGroup.name === relatedSourceGroup);
    if (!relatedSourceGroupObject) throw new Error(`Related source group not found: ${relatedSourceGroup}`);

    const newElasticStorage = elasticStoragePerHotTierDay * relatedSourceGroupObject.hotRetentionDays + elasticStoragePerColdTierDay * relatedSourceGroupObject.coldRetentionDays;
    const newS3Storage = S3StoragePerColdTierDay * relatedSourceGroupObject.coldRetentionDays;

    const newSource: Source = {
      name: sourceName,
      relatedSourceGroup: relatedSourceGroup,
      elasticStorage: newElasticStorage,
      S3Storage: newS3Storage,
      elasticStoragePerHotTierDay: elasticStoragePerHotTierDay,
      elasticStoragePerColdTierDay: elasticStoragePerColdTierDay,
      S3StoragePerColdTierDay: S3StoragePerColdTierDay,
    };
    handleAddSource(newSource);
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
            isInSimulation={isInSimulation}
            handleModeToggle={handleSimulationToggleWithConfirmation}
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
              thresholdMode={audience === 'user' ? 'medium' : 'none'}
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
              isInSimulation={isInSimulation}
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
          isInSimulation && (
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
              handleNewSource={handleNewSource}
            />
          )
        }
        isInSimulation={isInSimulation}
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
      {showExitSimulationModal && (
        <GenericModal showModal={showExitSimulationModal} setShowModal={setShowExitSimulationModal}>
          <div className="p-4">
            <h2 className="text-lg font-bold text-gray-800">{t.simulationExitTitle}</h2>
            <p className="mt-2 text-gray-700">{t.simulationExitMessage}</p>
            <div className="mt-4 flex justify-end">
              <button
                className="btn-secondary bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                onClick={cancelExitSimulation}
              >
                {t.cancel}
              </button>
              <button
                className="btn-primary bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mx-2"
                onClick={confirmExitSimulation}
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </GenericModal>
      )}
    </>
  );
};
