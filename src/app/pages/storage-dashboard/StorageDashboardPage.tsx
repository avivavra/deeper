"use client";

import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Pencil, Eye, Plus, MoreVertical } from 'lucide-react';
import { TooltipProps } from 'recharts';
import { Audience, ChangeLogEntry, IndexData } from './models';
import { clusters } from './exampleData';
import { translations } from './translations';
import ChangeLog from './ChangeLog';
import GenericDropdown from '../../components/GenericDropdown';
import StorageHeader from './StorageHeader';

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
  const [showClusterDropdown, setShowClusterDropdown] = useState(false);
  const [showIndexDropdown, setShowIndexDropdown] = useState(false);
  const [newIndex, setNewIndex] = useState<{ name: string; docSize: string; frequency: string; avgDocs: string; inputType: 'frequency' | 'avgDocs' }>({
    name: '',
    docSize: '',
    frequency: '',
    avgDocs: '',
    inputType: 'frequency'
  });
  const [audience, setAudience] = useState<Audience>('developer');
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<string | null>(null);

  const clusterDropdownRef = useRef(null);
  const indexDropdownRef = useRef(null);
  const exportDropdownRef = useRef(null);
  const threeDotsDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clusterDropdownRef.current && !clusterDropdownRef.current.contains(event.target as Node)) {
        setShowClusterDropdown(false);
      }
      if (indexDropdownRef.current && !indexDropdownRef.current.contains(event.target as Node)) {
        setShowIndexDropdown(false);
      }
      if (threeDotsDropdownRef.current && !threeDotsDropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownIndex(null);
      }
      if (!event.target.closest('.title-dropdown')) {
        setShowTitleDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedCluster) {
      setIndices(selectedCluster.indices);
      setSelectedIndices(selectedCluster.indices.reduce((acc, index) => ({ ...acc, [index.name]: true }), {}));
      handleResetChanges();
    }
  }, [selectedCluster]);

  useEffect(() => {
    document.documentElement.dir = audience;
  }, [audience]);

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

            {/* Retention Period Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">{t.indexRetentionPeriods}</h2>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredIndices}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                    <XAxis
                      dataKey={audience === 'developer' ? "name" : "hebrewName"}
                      reversed={audience === 'user'}
                    />
                    <YAxis
                      label={{ value: t.days, angle: audience === 'user' ? 90 : -90, position: audience === 'user' ? 'outsideLeft' : 'insideLeft' }}
                      orientation={audience === 'user' ? 'right' : 'left'}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {audience === 'developer' && (
                      <Bar dataKey="hotRetentionDays" stackId="a" fill="#2563eb" name={t.hotTier} />
                    )}
                    {audience === 'developer' && (
                      <Bar dataKey="coldRetentionDays" stackId="a" fill="#60a5fa" name={t.coldTier} />
                    )}
                    {audience === 'user' && (
                      <Bar dataKey="totalRetentionDays" fill="#2563eb" name={t.totalRetentionPeriod} />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Index Management */}
          <div className={`bg-white rounded-lg shadow-sm ${isEditMode ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">{t.indexRetentionManagement}</h2>
                {isEditMode && (
                  <button
                    onClick={() => setShowAddIndex(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mx-2 text-gray-800" />
                    {t.addIndex}
                  </button>
                )}
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredIndices.map(index => (
                    <div key={index.name} className="bg-gray-50 p-4 rounded-lg border relative">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-800">{audience === 'developer' ? index.name : index.hebrewName}</h3>
                        {isEditMode && (
                          <div className="relative" ref={threeDotsDropdownRef}>
                            <GenericDropdown
                              buttonLabel={<MoreVertical className="h-4 w-4 text-gray-800" />}
                              options={[
                                { label: t.removeIndex, value: 'remove' }
                              ]}
                              onSelect={() => handleRemoveIndex(index.name)}
                              width="w-40"
                              type="button"
                              showChevron={false}
                            />
                          </div>
                        )}
                      </div>

                      {isEditMode ? (
                        audience === 'user' ? (
                          <div className="space-y-2 mt-4">
                            <div className="flex justify-between text-sm text-gray-800">
                              <span>{t.totalRetentionPeriod}</span>
                              <span>{index.totalRetentionDays}</span>
                            </div>
                            <CustomSlider
                              value={[index.totalRetentionDays]}
                              min={1}
                              max={270}
                              onChange={(value) => handleTotalRetentionChange(index.name, value[0])}
                            />
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2 mt-4">
                              <div className="flex justify-between text-sm text-gray-800">
                                <span>{t.hotTierRetention}</span>
                                <span>{index.hotRetentionDays}</span>
                              </div>
                              <CustomSlider
                                value={[index.hotRetentionDays]}
                                min={1}
                                max={90}
                                onChange={(value) => handleRetentionChange(index.name, value[0], index.coldRetentionDays)}
                              />
                            </div>

                            <div className="space-y-2 mt-4">
                              <div className="flex justify-between text-sm text-gray-800">
                                <span>{t.coldTierRetention}</span>
                                <span>{index.coldRetentionDays}</span>
                              </div>
                              <CustomSlider
                                value={[index.coldRetentionDays]}
                                min={0}
                                max={180}
                                onChange={(value) => handleRetentionChange(index.name, index.hotRetentionDays, value[0])}
                              />
                            </div>
                          </>
                        )
                      ) : (
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          {audience === 'developer' && (
                            <>
                              <div>
                                <span className="text-sm font-medium text-gray-800">{t.hotTierRetention}:</span>
                                <span className="text-sm ml-2 text-gray-800">{index.hotRetentionDays} {t.days}</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-800">{t.coldTierRetention}:</span>
                                <span className="text-sm ml-2 text-gray-800">{index.coldRetentionDays} {t.days}</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between text-sm font-bold text-gray-800 mt-4">
                        <span>{t.totalRetentionPeriod}</span>
                        <span>{index.totalRetentionDays} {t.days}</span>
                      </div>

                      {audience === 'user' ? (
                        <div className="flex justify-between text-sm text-gray-800 mt-4">
                          <span>{t.storage}</span>
                          <span dir='ltr'>{index.elasticStorageGB + index.S3StorageGB} GB</span>
                        </div>
                      ) : (
                        <div className="text-sm space-x-4 mt-4">
                          <span className="text-gray-800">Elasticsearch: {index.elasticStorageGB} GB</span>
                          <span className="text-gray-800">S3: {index.S3StorageGB} GB</span>
                          <span className="text-gray-500">
                            ({index.elasticStoragePerHotTierDay.toFixed(2)}GB/day hot, {index.S3StoragePerColdTierDay.toFixed(2)}GB/day cold)
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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