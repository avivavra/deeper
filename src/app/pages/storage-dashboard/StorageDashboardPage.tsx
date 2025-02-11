"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Audience, ChangeLogEntry, IndexData } from './models';
import { clusters } from './exampleData';
import { translations } from './translations';
import ChangeLog from './ChangeLog';
import StorageHeader from './StorageHeader';
import StorageUsageOverview from './StorageUsageOverview';
import IndexRetentionPeriodsChart from './IndexRetentionPeriodsChart';
import IndexRetentionManagement from './IndexRetentionManagement';

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
  const [newIndex, setNewIndex] = useState<{ name: string; docSize: string; frequency: string; avgDocs: string; inputType: 'frequency' | 'avgDocs' }>({
    name: '',
    docSize: '',
    frequency: '',
    avgDocs: '',
    inputType: 'frequency'
  });
  const [audience, setAudience] = useState<Audience>('developer');

  useEffect(() => {
    if (selectedCluster) {
      setIndices(selectedCluster.indices);
      setSelectedIndices(selectedCluster.indices.reduce((acc, index) => ({ ...acc, [index.name]: true }), {}));
      handleResetChanges();
    }
  }, [selectedCluster]);

  useEffect(() => {
    document.documentElement.dir = audience === 'developer' ? 'ltr' : 'rtl';
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

  const usedElasticStorage = indices.reduce((acc, curr) => acc + curr.elasticStorageGB, 0);
  const usedS3Storage = indices.reduce((acc, curr) => acc + curr.S3StorageGB, 0);
  const elasticStoragePercentage = (usedElasticStorage / totalElasticStorage) * 100;
  const s3StoragePercentage = (usedS3Storage / totalS3Storage) * 100;
  const usedCombinedStorage = usedElasticStorage + usedS3Storage;

  const combinedStorage = totalElasticStorage + totalS3Storage;
  const combinedStoragePercentage = (usedCombinedStorage / combinedStorage) * 100;

  const filteredIndices = indices.filter(index => selectedIndices[index.name]);

  const t = translations[audience];

  const getStorageBarColor = (percentage: number) => {
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 70) return 'bg-orange-500';
    return 'bg-blue-600';
  };

  const calculateRates = (docSize: number, frequency: number, avgDocs: number, inputType: 'frequency' | 'avgDocs') => {
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
    const rates = calculateRates(Number(newIndex.docSize), Number(newIndex.frequency), Number(newIndex.avgDocs), newIndex.inputType);
    const hotRetentionDays = 30;
    const coldRetentionDays = 90;

    const newIndexData = {
      name: newIndex.name,
      hebrewName: newIndex.name, // Add appropriate Hebrew name here
      ...rates,
      hotRetentionDays,
      coldRetentionDays,
      elasticStorageGB: Math.round(rates.elasticStoragePerHotTierDay * hotRetentionDays),
      s3StorageGB: Math.round(rates.S3StoragePerColdTierDay * coldRetentionDays),
      totalRetentionDays: hotRetentionDays + coldRetentionDays,
      initialHotRetentionDays: hotRetentionDays, // Store initial hot retention days
      initialColdRetentionDays: coldRetentionDays // Store initial cold retention days
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
          s3Storage: newIndexData.s3StorageGB,
        }
      }
    }));
    setNewIndex({ name: '', docSize: '', frequency: '', avgDocs: '', inputType: 'frequency' });
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
          const isNewIndex = !originalIndex;

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

  const handleExport = () => {
    const text = Object.entries(changeLog).map(([indexName, change]) => {
      const hotDaysChange = change.current.hotDays - change.original.hotDays;
      const coldDaysChange = change.current.coldDays - change.original.coldDays;
      const totalElasticStorageChange = change.current.elasticStorage - change.original.elasticStorage;
      const totalS3StorageChange = change.current.s3Storage - change.original.s3Storage;

      return `Index: ${indexName}
Hot Retention Days: ${change.original.hotDays} → ${change.current.hotDays} days (${hotDaysChange > 0 ? '+' : ''}${hotDaysChange} days)
Cold Retention Days: ${change.original.coldDays} → ${change.current.coldDays} days (${coldDaysChange > 0 ? '+' : ''}${coldDaysChange} days)
Elasticsearch Storage: ${change.original.elasticStorage} GB → ${change.current.elasticStorage} GB (${totalElasticStorageChange > 0 ? '+' : ''}${totalElasticStorageChange} GB)
S3 Storage: ${change.original.s3Storage} GB → ${change.current.s3Storage} GB (${totalS3StorageChange > 0 ? '+' : ''}${totalS3StorageChange} GB)
`;
    }).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'storage-changes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEmail = () => {
    const text = Object.entries(changeLog).map(([indexName, change]) => {
      const hotDaysChange = change.current.hotDays - change.original.hotDays;
      const coldDaysChange = change.current.coldDays - change.original.coldDays;
      const totalElasticStorageChange = change.current.elasticStorage - change.original.elasticStorage;
      const totalS3StorageChange = change.current.s3Storage - change.original.s3Storage;

      return `Index: ${indexName}
Hot Retention Days: ${change.original.hotDays} → ${change.current.hotDays} days (${hotDaysChange > 0 ? '+' : ''}${hotDaysChange} days)
Cold Retention Days: ${change.original.coldDays} → ${change.current.coldDays} days (${coldDaysChange > 0 ? '+' : ''}${coldDaysChange} days)
Elasticsearch Storage: ${change.original.elasticStorage} GB → ${change.current.elasticStorage} GB (${totalElasticStorageChange > 0 ? '+' : ''}${totalElasticStorageChange} GB)
S3 Storage: ${change.original.s3Storage} GB → ${change.current.s3Storage} GB (${totalS3StorageChange > 0 ? '+' : ''}${totalS3StorageChange} GB)
`;
    }).join('\n');

    const subject = 'Elasticsearch Index Changes';
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = mailtoLink;
  };


  const handleResetChanges = () => {
    setIndices(selectedCluster.indices);
    setChangeLog({});
    setSelectedIndices(selectedCluster.indices.reduce((acc, index) => ({ ...acc, [index.name]: true }), {}));
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const text = e.target?.result as string;
          const entries = text.split('\n\n');
          entries.forEach(entry => {
            const lines = entry.trim().split('\n');
            if (lines.length >= 5) {
              const indexName = lines[0].replace('Index: ', '');
              const hotDaysMatch = lines[1].match(/Hot Retention Days: \d+ → (\d+) days/);
              const coldDaysMatch = lines[2].match(/Cold Retention Days: \d+ → (\d+) days/);
              const elasticStorageMatch = lines[3].match(/Elasticsearch Storage: \d+ GB → (\d+) GB/);
              const s3StorageMatch = lines[4].match(/S3 Storage: \d+ GB → (\d+) GB/);

              if (hotDaysMatch && coldDaysMatch && elasticStorageMatch && s3StorageMatch) {
                const newHotDays = parseInt(hotDaysMatch[1]);
                const newColdDays = parseInt(coldDaysMatch[1]);
                handleRetentionChange(indexName, newHotDays, newColdDays);
              }
            }
          });
        } catch (error) {
          console.error('Error importing changes:', error);
        }
      };
      reader.readAsText(file);
    }
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
    setOpenDropdownIndex(null);
  };


  // Custom Slider component
  const CustomSlider = ({ value, min, max, onChange }: { value: number[]; min: number; max: number; onChange: (value: number[]) => void }) => {
    const [sliderValue, setSliderValue] = useState(value[0]);
    const sliderRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value);
      setSliderValue(newValue);
    };

    const handleMouseUp = () => {
      onChange([sliderValue]);
    };

    return (
      <input
        ref={sliderRef}
        type="range"
        min={min}
        max={max}
        value={sliderValue}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    );
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-sm">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="text-gray-700">{`${entry.name}: ${entry.value}`}</p>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StorageHeader
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
        {/* Change Log Sidebar */}
        {isEditMode && (
          <ChangeLog
            changeLog={changeLog}
            audience={audience}
            indices={indices}
            selectedCluster={selectedCluster}
            handleRevertChange={handleRevertChange}
            handleExport={handleExport}
            handleEmail={handleEmail}
            handleResetChanges={handleResetChanges}
            handleImport={handleImport}
          />
        )}
        <div className={`flex-grow p-6 space-y-6 ${isEditMode ? 'lg:w-[calc(100%-20rem)]' : ''}`}>
          {/* Storage Overview and Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Storage Overview */}
            <StorageUsageOverview
              audience={audience}
              usedCombinedStorage={usedCombinedStorage}
              combinedStorage={combinedStorage}
              combinedStoragePercentage={combinedStoragePercentage}
              usedElasticStorage={usedElasticStorage}
              totalElasticStorage={totalElasticStorage}
              elasticStoragePercentage={elasticStoragePercentage}
              usedS3Storage={usedS3Storage}
              totalS3Storage={totalS3Storage}
              s3StoragePercentage={s3StoragePercentage}
              t={t}
              getStorageBarColor={getStorageBarColor}
            />
            {/* Retention Period Chart */}
            <IndexRetentionPeriodsChart
              audience={audience}
              filteredIndices={filteredIndices}
              t={t}
            />
          </div>
          {/* Index Management */}
          <IndexRetentionManagement
            isEditMode={isEditMode}
            filteredIndices={filteredIndices}
            audience={audience}
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
      {/* Add Index Modal */}
      {showAddIndex && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-96">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{t.addIndex}</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-800">{t.indexName}</label>
                  <input
                    type="text"
                    value={newIndex.name}
                    onChange={(e) => setNewIndex(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder={t.indexNamePlaceholder}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800">{t.avgDocSize}</label>
                  <input
                    type="number"
                    value={newIndex.docSize}
                    onChange={(e) => setNewIndex(prev => ({ ...prev, docSize: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder={t.avgDocSizePlaceholder}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800">{t.inputType}</label>
                  <select
                    value={newIndex.inputType}
                    onChange={(e) => setNewIndex(prev => ({ ...prev, inputType: e.target.value as 'frequency' | 'avgDocs' }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="frequency">{t.docFrequency}</option>
                    <option value="avgDocs">{t.avgDocs}</option>
                  </select>
                </div>
                {newIndex.inputType === 'frequency' ? (
                  <div>
                    <label className="text-sm font-medium text-gray-800">{t.docFrequency}</label>
                    <input
                      type="number"
                      value={newIndex.frequency}
                      onChange={(e) => setNewIndex(prev => ({ ...prev, frequency: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder={t.docFrequencyPlaceholder}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-gray-800">{t.avgDocs}</label>
                    <input
                      type="number"
                      value={newIndex.avgDocs}
                      onChange={(e) => setNewIndex(prev => ({ ...prev, avgDocs: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder={t.avgDocsPlaceholder}
                    />
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setShowAddIndex(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleAddIndex}
                    disabled={!newIndex.name || !newIndex.docSize || (!newIndex.frequency && !newIndex.avgDocs)}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${!newIndex.name || !newIndex.docSize || (!newIndex.frequency && !newIndex.avgDocs)
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    {t.addIndexButton}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageDashboardPage;