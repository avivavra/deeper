"use client";

import React, { useState, useEffect } from 'react';
import { Audience, ChangeLogEntry, Direction, DisplayMethod, IndexData, NewIndexInputType, Translation } from './models';
import { clusters } from './exampleData';
import { translations } from './translations';
import ChangeLog from './ChangeLog';
import StorageHeader from './StorageHeader';
import StorageUsageOverview from './StorageUsageOverview';
import IndexRetentionPeriodsChart from './IndexRetentionPeriodsChart';
import IndexRetentionManagement from './IndexRetentionManagement';
import AddIndexForm from './AddIndexModal';
import GenericModal from '../../components/GenericModal';

const StorageDashboardPage = () => {
  // Original data and main states
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState(clusters[0]);
  const [selectedIndices, setSelectedIndices] = useState<{ [key: string]: boolean }>({});
  const [indices, setIndices] = useState<IndexData[]>(clusters[0].indices);
  const [changeLog, setChangeLog] = useState<{ [key: string]: ChangeLogEntry }>({});
  const [totalElasticStorage] = useState(500); // GB
  const [totalS3Storage] = useState(1000); // GB
  const [showAddIndex, setShowAddIndex] = useState(false);
  const [newIndex, setNewIndex] = useState<{ name: string; docSize: string; frequency: string; avgDocs: string; inputType: NewIndexInputType; totalRetention: string; coldRetention: string }>({
    name: '',
    docSize: '',
    frequency: '',
    avgDocs: '',
    inputType: 'frequency',
    totalRetention: '',
    coldRetention: ''
  });
  const [audience, setAudience] = useState<Audience>('developer');

  const t = translations[audience === 'user' ? 'hebrew' : 'english'];
  const direction: Direction = audience === 'user' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (selectedCluster) {
      setIndices(selectedCluster.indices);
      setSelectedIndices(selectedCluster.indices.reduce((acc, index) => ({ ...acc, [index.name]: true }), {}));
      handleResetChanges();
    }
  }, [selectedCluster]);

  useEffect(() => {
    document.documentElement.dir = direction;
  }, [audience]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        setAudience(prev => (prev === 'developer' ? 'user' : 'developer'));
      }
      if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        setIsEditMode(prev => {
          if (prev) {
            handleResetChanges();
          }
          return !prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const usedElasticStorage = parseFloat(indices.reduce((acc, curr) => acc + curr.elasticStorageGB, 0).toFixed(2));
  const usedS3Storage = parseFloat(indices.reduce((acc, curr) => acc + curr.S3StorageGB, 0).toFixed(2));
  const elasticStoragePercentage = parseFloat(((usedElasticStorage / totalElasticStorage) * 100).toFixed(2));
  const s3StoragePercentage = parseFloat(((usedS3Storage / totalS3Storage) * 100).toFixed(2));
  const usedCombinedStorage = parseFloat((usedElasticStorage + usedS3Storage).toFixed(2));

  const combinedStorage = totalElasticStorage + totalS3Storage;
  const combinedStoragePercentage = parseFloat(((usedCombinedStorage / combinedStorage) * 100).toFixed(2));

  const filteredIndices = indices.filter(index => selectedIndices[index.name]);

  const getStorageBarColor = (percentage: number) => {
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 70) return 'bg-orange-500';
    return 'bg-blue-600';
  };

  const calculateRates = (docSize: number, frequency: number, avgDocs: number, inputType: NewIndexInputType) => {
    const dailyData = inputType === 'frequency'
      ? (docSize * frequency * 86400) / (1024 * 1024 * 1024)
      : (docSize * avgDocs) / (1024 * 1024 * 1024);
    return {
      elasticStoragePerHotTierDay: dailyData,
      S3StoragePerColdTierDay: dailyData * 0.75,
      elasticStoragePerColdTierDay: dailyData * 0.05
    };
  };

  const handleAddIndex = () => {
    let rates;
    if (newIndex.inputType === 'import') {
        const selectedIndex = indices.find(index => index.name === newIndex.importFromIndex);
        if (selectedIndex) {
            rates = {
                elasticStoragePerHotTierDay: selectedIndex.elasticStoragePerHotTierDay,
                S3StoragePerColdTierDay: selectedIndex.S3StoragePerColdTierDay,
                elasticStoragePerColdTierDay: selectedIndex.elasticStoragePerColdTierDay
            };
        } else {
            // If selectedIndex is not found, set default rates to avoid undefined error
            rates = {
                elasticStoragePerHotTierDay: 0,
                S3StoragePerColdTierDay: 0,
                elasticStoragePerColdTierDay: 0
            };
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
    setNewIndex({ name: '', docSize: '', frequency: '', avgDocs: '', inputType: 'frequency', totalRetention: '', coldRetention: '' });
    setShowAddIndex(false);
};

  const handleIndexToggle = (indexName: string) => {
    setSelectedIndices(prev => ({
      ...prev,
      [indexName]: !prev[indexName]
    }));
  };

  const handleRetentionChange = (indexName: string, newHotDays: number, newColdDays: number) => {
    setIndices(prevIndices => {
      const newIndices = prevIndices.map(index => {
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

      const newIndex = newIndices.find(i => i.name === indexName);
      const originalIndex = selectedCluster.indices.find(i => i.name === indexName);

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
            elasticStorage: newIndex.elasticStorageGB,
            s3Storage: newIndex.S3StorageGB,
          }
        }
      }));

      return newIndices;
    });
  };

  const handleTotalRetentionChange = (indexName: string, newTotalDays: number) => {
    setIndices(prevIndices => {
      const newIndices = prevIndices.map(index => {
        if (index.name === indexName) {
          const originalIndex = selectedCluster.indices.find(i => i.name === indexName);

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
      const originalIndex = selectedCluster.indices.find(i => i.name === indexName);

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
            hotDays: newIndex.hotRetentionDays,
            coldDays: newIndex.coldRetentionDays,
            elasticStorage: newIndex.elasticStorageGB,
            s3Storage: newIndex.S3StorageGB,
          }
        }
      }));

      return newIndices;
    });
  };

  const handleModeToggle = () => {
    if (isEditMode) {
      handleResetChanges();
    }
    setIsEditMode(!isEditMode);
  };

  const handleRevertChange = (indexName: string) => {
    const originalIndex = selectedCluster.indices.find(i => i.name === indexName);
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

  const handleResetChanges = () => {
    setIndices(selectedCluster.indices);
    setChangeLog({});
    setSelectedIndices(selectedCluster.indices.reduce((acc, index) => ({ ...acc, [index.name]: true }), {}));
  };

  const handleRemoveIndex = (indexName: string) => {
    const indexToRemove = indices.find(index => index.name === indexName);
    if (!indexToRemove) return;

    setIndices(prevIndices => prevIndices.filter(index => index.name !== indexName));
    setSelectedIndices(prev => {
      const { [indexName]: _, ...rest } = prev;
      return rest;
    });

    setChangeLog(prev => {
      const isNewIndex = !selectedCluster.indices.some(index => index.name === indexName);
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
    displayMethod: audience === 'user' ? 'combined' : 'separate',
    translateIndexNames: audience === 'user',
    displayRates: audience === 'developer'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StorageHeader
        {...displayProps}
        audience={audience}
        setAudience={setAudience}
        clusters={clusters}
        selectedCluster={selectedCluster}
        setSelectedCluster={setSelectedCluster}
        indices={indices}
        selectedIndices={selectedIndices}
        handleIndexToggle={handleIndexToggle}
        isEditMode={isEditMode}
        handleModeToggle={handleModeToggle}
      />
      {/* Main Content */}
      <div className="flex">
        {isEditMode && (
          <ChangeLog
            {...displayProps}
            changeLog={changeLog}
            indices={indices}
            selectedCluster={selectedCluster}
            handleRevertChange={handleRevertChange}
            handleResetChanges={handleResetChanges}
            setIndices={setIndices}
            handleRetentionChange={handleRetentionChange}
            setSelectedIndices={setSelectedIndices}
            setChangeLog={setChangeLog}
          />
        )}
        <div className={`flex-grow p-6 space-y-6 ${isEditMode ? 'lg:w-[calc(100%-20rem)]' : ''}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              getStorageBarColor={getStorageBarColor}
            />
            <IndexRetentionPeriodsChart
              {...displayProps}
              filteredIndices={filteredIndices}
            />
          </div>
          <IndexRetentionManagement
            {...displayProps}
            isEditMode={isEditMode}
            filteredIndices={filteredIndices}
            t={t}
            handleTotalRetentionChange={handleTotalRetentionChange}
            handleRetentionChange={handleRetentionChange}
            handleRemoveIndex={handleRemoveIndex}
            setShowAddIndex={setShowAddIndex}
            showAddIndex={showAddIndex}
            newIndex={newIndex}
            setNewIndex={setNewIndex}
            handleAddIndex={handleAddIndex}
          />
        </div>
      </div>
      {showAddIndex && (
        <GenericModal
          showModal={showAddIndex}
          setShowModal={setShowAddIndex}
        >
          <AddIndexForm
            {...displayProps}
            newIndex={newIndex}
            setNewIndex={setNewIndex}
            setShowAddIndex={setShowAddIndex}
            handleAddIndex={handleAddIndex}
            indices={indices}
          />
        </GenericModal>
      )}
    </div>
  );
};

export default StorageDashboardPage;