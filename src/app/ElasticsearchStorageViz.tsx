"use client";

import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Pencil, Eye, Share2, ChevronDown, Upload, RotateCcw, Plus } from 'lucide-react';
import { TooltipProps } from 'recharts';

const ElasticsearchStorageViz = () => {
  // Original data and main states
  const originalIndices = [
    {
      name: 'logs-production',
      hotTierRate: 4,
      coldTierStorageRate: 3,
      coldTierHotRate: 0.2,
      hotRetentionDays: 30,
      coldRetentionDays: 90,
      hotStorageGB: 120,
      coldStorageGB: 270,
      totalRetentionDays: 120
    },
    {
      name: 'metrics-app1',
      hotTierRate: 2,
      coldTierStorageRate: 1.5,
      coldTierHotRate: 0.1,
      hotRetentionDays: 15,
      coldRetentionDays: 45,
      hotStorageGB: 30,
      coldStorageGB: 67.5,
      totalRetentionDays: 60
    },
    {
      name: 'metrics-app2',
      hotTierRate: 3,
      coldTierStorageRate: 2,
      coldTierHotRate: 0.15,
      hotRetentionDays: 20,
      coldRetentionDays: 70,
      hotStorageGB: 60,
      coldStorageGB: 140,
      totalRetentionDays: 90
    },
    {
      name: 'audit-logs',
      hotTierRate: 1,
      coldTierStorageRate: 2.5,
      coldTierHotRate: 0.25,
      hotRetentionDays: 10,
      coldRetentionDays: 120,
      hotStorageGB: 10,
      coldStorageGB: 300,
      totalRetentionDays: 130
    },
    {
      name: 'user-activity',
      hotTierRate: 2.5,
      coldTierStorageRate: 2,
      coldTierHotRate: 0.12,
      hotRetentionDays: 25,
      coldRetentionDays: 60,
      hotStorageGB: 62.5,
      coldStorageGB: 120,
      totalRetentionDays: 85
    }
  ];

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState(
    originalIndices.reduce((acc, index) => ({ ...acc, [index.name]: true }), {})
  );
  const [indices, setIndices] = useState(originalIndices);
  const [changeLog, setChangeLog] = useState({});
  const [totalHotStorage] = useState(500); // GB
  const [totalColdStorage] = useState(1000); // GB
  const [showAddIndex, setShowAddIndex] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newIndex, setNewIndex] = useState({
    name: '',
    docSize: '',
    frequency: ''
  });

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const usedHotStorage = indices.reduce((acc, curr) => acc + curr.hotStorageGB, 0);
  const usedColdStorage = indices.reduce((acc, curr) => acc + curr.coldStorageGB, 0);
  const filteredIndices = indices.filter(index => selectedIndices[index.name]);

  // All the handlers remain the same...
  const calculateRates = (docSize, frequency) => {
    const dailyData = (docSize * frequency * 86400) / (1024 * 1024 * 1024);
    return {
      hotTierRate: dailyData,
      coldTierStorageRate: dailyData * 0.75,
      coldTierHotRate: dailyData * 0.05
    };
  };

  const handleAddIndex = () => {
    const rates = calculateRates(Number(newIndex.docSize), Number(newIndex.frequency));
    const hotRetentionDays = 30;
    const coldRetentionDays = 90;

    const newIndexData = {
      name: newIndex.name,
      ...rates,
      hotRetentionDays,
      coldRetentionDays,
      hotStorageGB: Math.round(rates.hotTierRate * hotRetentionDays),
      coldStorageGB: Math.round(rates.coldTierStorageRate * coldRetentionDays),
      totalRetentionDays: hotRetentionDays + coldRetentionDays
    };

    setIndices([...indices, newIndexData]);
    setSelectedIndices(prev => ({ ...prev, [newIndex.name]: true }));
    setNewIndex({ name: '', docSize: '', frequency: '' });
    setShowAddIndex(false);
  };

  const handleIndexToggle = (indexName) => {
    setSelectedIndices(prev => ({
      ...prev,
      [indexName]: !prev[indexName]
    }));
  };

  const handleRetentionChange = (indexName, newHotDays, newColdDays) => {
    const oldIndex = indices.find(i => i.name === indexName);
    const newIndices = indices.map(index => {
      if (index.name === indexName) {
        const newHotStorage = Math.round(
          (index.hotTierRate * newHotDays) +
          (index.coldTierHotRate * newColdDays)
        );
        const newColdStorage = Math.round(
          index.coldTierStorageRate * newColdDays
        );

        return {
          ...index,
          hotRetentionDays: newHotDays,
          coldRetentionDays: newColdDays,
          totalRetentionDays: newHotDays + newColdDays,
          hotStorageGB: newHotStorage,
          coldStorageGB: newColdStorage
        };
      }
      return index;
    });

    const newIndex = newIndices.find(i => i.name === indexName);

    setChangeLog(prev => ({
      ...prev,
      [indexName]: {
        original: {
          hotDays: originalIndices.find(i => i.name === indexName).hotRetentionDays,
          coldDays: originalIndices.find(i => i.name === indexName).coldRetentionDays,
          hotStorage: originalIndices.find(i => i.name === indexName).hotStorageGB,
          coldStorage: originalIndices.find(i => i.name === indexName).coldStorageGB,
        },
        current: {
          hotDays: newHotDays,
          coldDays: newColdDays,
          hotStorage: newIndex.hotStorageGB,
          coldStorage: newIndex.coldStorageGB,
        }
      }
    }));

    setIndices(newIndices);
  };

  const handleModeToggle = () => {
    if (isEditMode) {
      setIndices(originalIndices);
      setChangeLog({});
    }
    setIsEditMode(!isEditMode);
  };

  const handleRevertChange = (indexName) => {
    const originalIndex = originalIndices.find(i => i.name === indexName);
    setIndices(indices.map(index =>
      index.name === indexName ? originalIndex : index
    ));

    setChangeLog(prev => {
      const { [indexName]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleExport = () => {
    const text = Object.entries(changeLog).map(([indexName, change]) => {
      const hotStorageChange = change.current.hotStorage - change.original.hotStorage;
      const coldStorageChange = change.current.coldStorage - change.original.coldStorage;

      return `Index: ${indexName}
Hot Tier: ${change.original.hotDays} → ${change.current.hotDays} days (${hotStorageChange > 0 ? '+' : ''}${hotStorageChange} GB)
Cold Tier: ${change.original.coldDays} → ${change.current.coldDays} days (${coldStorageChange > 0 ? '+' : ''}${coldStorageChange} GB)
`;
    }).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elasticsearch-changes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEmail = () => {
    const text = Object.entries(changeLog).map(([indexName, change]) => {
      const hotStorageChange = change.current.hotStorage - change.original.hotStorage;
      const coldStorageChange = change.current.coldStorage - change.original.coldStorage;

      return `Index: ${indexName}
Hot Tier: ${change.original.hotDays} → ${change.current.hotDays} days (${hotStorageChange > 0 ? '+' : ''}${hotStorageChange} GB)
Cold Tier: ${change.original.coldDays} → ${change.current.coldDays} days (${coldStorageChange > 0 ? '+' : ''}${coldStorageChange} GB)
`;
    }).join('\n');

    const subject = 'Elasticsearch Index Changes';
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = mailtoLink;
  };

  const handleResetChanges = () => {
    setIndices(originalIndices);
    setChangeLog({});
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const entries = text.split('\n\n');
          entries.forEach(entry => {
            const lines = entry.trim().split('\n');
            if (lines.length >= 3) {
              const indexName = lines[0].replace('Index: ', '');
              const hotMatch = lines[1].match(/Hot Tier: (\d+) → (\d+) days/);
              const coldMatch = lines[2].match(/Cold Tier: (\d+) → (\d+) days/);

              if (hotMatch && coldMatch) {
                handleRetentionChange(indexName, parseInt(hotMatch[2]), parseInt(coldMatch[2]));
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

  // Custom Slider component
  const CustomSlider = ({ value, min, max, onChange }) => {
    const handleChange = (e) => {
      const newValue = parseInt(e.target.value);
      onChange([newValue]);
    };

    return (
      <input
        type="range"
        min={min}
        max={max}
        value={value[0]}
        onChange={handleChange}
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
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Elasticsearch Storage Dashboard</h1>
          <div className="flex gap-4">
            {/* Filter Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Filter Indices
                <ChevronDown className="ml-2 h-4 w-4 text-gray-800" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    {indices.map(index => (
                      <div
                        key={index.name}
                        className="flex items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleIndexToggle(index.name)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIndices[index.name]}
                          onChange={() => { }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2">{index.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Edit/View Mode Toggle */}
            <button
              onClick={handleModeToggle}
              className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isEditMode
                  ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500'
                  : 'border-gray-300 text-gray-800 bg-white hover:bg-gray-50 focus:ring-blue-500'
                }`}
            >
              {isEditMode ? (
                <>
                  <Eye className="h-4 w-4 mr-2 text-gray-800" />
                  View Mode
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2 text-gray-800" />
                  Edit Mode
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Storage Overview and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Storage Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Storage Usage Overview</h2>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-800">Hot Tier Storage</span>
                  <span className={usedHotStorage > totalHotStorage ? "text-red-500 font-medium" : "text-gray-800"}>
                    {usedHotStorage}/{totalHotStorage} GB
                    {usedHotStorage > totalHotStorage && ` (${((usedHotStorage / totalHotStorage) * 100 - 100).toFixed(1)}% over limit)`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 relative overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${usedHotStorage > totalHotStorage ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min((usedHotStorage / totalHotStorage) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-800">Cold Tier Storage (S3)</span>
                  <span className={usedColdStorage > totalColdStorage ? "text-red-500 font-medium" : "text-gray-800"}>
                    {usedColdStorage}/{totalColdStorage} GB
                    {usedColdStorage > totalColdStorage && ` (${((usedColdStorage / totalColdStorage) * 100 - 100).toFixed(1)}% over limit)`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 relative overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${usedColdStorage > totalColdStorage ? 'bg-red-500' : 'bg-blue-400'}`}
                    style={{ width: `${Math.min((usedColdStorage / totalColdStorage) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Retention Period Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Index Retention Periods</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredIndices}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="hotRetentionDays" stackId="a" fill="#2563eb" name="Hot Tier" />
                  <Bar dataKey="coldRetentionDays" stackId="a" fill="#60a5fa" name="Cold Tier" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Change Log and Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Change Log */}
          {isEditMode && (
            <div className="bg-white rounded-lg shadow-sm flex flex-col h-full">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Change Log</h2>
                  <div className="flex gap-2">
                    {Object.keys(changeLog).length > 0 ? (
                      <>
                        <button
                          onClick={handleExport}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Share2 className="h-4 w-4 mr-1 text-gray-800" />
                          Export
                        </button>
                        <button
                          onClick={handleEmail}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Share2 className="h-4 w-4 mr-1 text-gray-800" />
                          Email
                        </button>
                        <button
                          onClick={handleResetChanges}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <RotateCcw className="h-4 w-4 mr-1 text-gray-800" />
                          Reset All
                        </button>
                      </>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          onChange={handleImport}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept=".txt"
                        />
                        <button
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Upload className="h-4 w-4 mr-1 text-gray-800" />
                          Import Changes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="max-h-full overflow-y-auto">
                  <div className="space-y-4">
                    {Object.keys(changeLog).length > 0 ? (
                      Object.entries(changeLog).map(([indexName, change]) => {
                        const hotStorageChange = change.current.hotStorage - change.original.hotStorage;
                        const coldStorageChange = change.current.coldStorage - change.original.coldStorage;

                        return (
                          <div key={indexName} className="text-sm border-l-2 border-blue-500 pl-3">
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-gray-800">{indexName}</div>
                              <button
                                onClick={() => handleRevertChange(indexName)}
                                className="px-2 py-1 text-sm text-gray-500 hover:text-red-500 focus:outline-none"
                              >
                                Revert
                              </button>
                            </div>
                            <div className="text-gray-600 mt-1">
                              Hot Tier: {change.original.hotDays} → {change.current.hotDays} days
                            </div>
                            <div className="text-gray-600">
                              Cold Tier: {change.original.coldDays} → {change.current.coldDays} days
                            </div>
                            <div className="font-medium text-gray-800 mt-2">Impact:</div>
                            <div className="text-sm ml-2 text-gray-800">
                              Hot Tier: {hotStorageChange > 0 ? '+' : ''}{hotStorageChange} GB
                            </div>
                            <div className="text-sm ml-2 text-gray-800">
                              Cold Tier: {coldStorageChange > 0 ? '+' : ''}{coldStorageChange} GB
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-500 text-center py-4">
                        No changes made yet. Adjust retention periods to see changes here.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Index Management */}
          <div className={`bg-white rounded-lg shadow-sm ${isEditMode ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Index Retention Management</h2>
                {isEditMode && (
                  <button
                    onClick={() => setShowAddIndex(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-2 text-gray-800" />
                    Add Index
                  </button>
                )}
              </div>
              <div className="space-y-6">
                {filteredIndices.map(index => (
                  <div key={index.name} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-800">{index.name}</h3>
                      <div className="text-sm space-x-4">
                        <span className="text-gray-800">Hot: {index.hotStorageGB} GB</span>
                        <span className="text-gray-800">Cold: {index.coldStorageGB} GB</span>
                        <span className="text-gray-500">
                          ({index.hotTierRate.toFixed(2)}GB/day hot, {index.coldTierStorageRate.toFixed(2)}GB/day cold)
                        </span>
                      </div>
                    </div>

                    {isEditMode ? (
                      <>
                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between text-sm text-gray-800">
                            <span>Hot Tier Retention (days)</span>
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
                            <span>Cold Tier Retention (days)</span>
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
                    ) : (
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <span className="text-sm font-medium text-gray-800">Hot Tier Retention:</span>
                          <span className="text-sm ml-2 text-gray-800">{index.hotRetentionDays} days</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-800">Cold Tier Retention:</span>
                          <span className="text-sm ml-2 text-gray-800">{index.coldRetentionDays} days</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-medium text-gray-800 mt-4">
                      <span>Total Retention Period</span>
                      <span>{index.totalRetentionDays} days</span>
                    </div>
                  </div>
                ))}
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
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Index</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-800">Index Name</label>
                  <input
                    type="text"
                    value={newIndex.name}
                    onChange={(e) => setNewIndex(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1024"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800">Document Frequency (per second)</label>
                  <input
                    type="number"
                    value={newIndex.frequency}
                    onChange={(e) => setNewIndex(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 100"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setShowAddIndex(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddIndex}
                    disabled={!newIndex.name || !newIndex.docSize || !newIndex.frequency}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${!newIndex.name || !newIndex.docSize || !newIndex.frequency
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    Add Index
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

export default ElasticsearchStorageViz;