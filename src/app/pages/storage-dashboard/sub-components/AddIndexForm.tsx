import React, { useState } from 'react';
import { IndexData, Translation, NewIndexInputType } from '../models';
import { config } from '@/config';

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

type NewIndex = {
    name: string;
    docSize: string;
    frequency: string;
    avgDocs: string;
    inputType: NewIndexInputType;
    totalRetention: string;
    coldRetention: string;
    importFromIndex: string;
};

interface AddIndexForm {
    t: Translation;
    setShowAddIndex: React.Dispatch<React.SetStateAction<boolean>>;
    handleAddIndex: (newIndexData: IndexData) => void;
    indices: IndexData[];
    translateIndexNames: boolean;
}

export const AddIndexForm: React.FC<AddIndexForm> = ({ t, setShowAddIndex, handleAddIndex, indices, translateIndexNames }) => {
    const [newIndex, setNewIndex] = useState<NewIndex>(emptyNewIndex());

    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

    const handleColdRetentionChange = (value: string) => {
        if (parseInt(value) > parseInt(newIndex.totalRetention)) {
            setNewIndex(prev => ({ ...prev, coldRetention: newIndex.totalRetention }));
        } else {
            setNewIndex(prev => ({ ...prev, coldRetention: value }));
        }
    };

    const handleImportFromIndex = (indexName: string) => {
        const selectedIndex = indices.find(index => index.name === indexName);
        if (selectedIndex) {
            setNewIndex(prev => ({
                ...prev,
                docSize: selectedIndex.elasticStoragePerHotTierDay.toString(),
                frequency: '',
                avgDocs: '',
                inputType: 'import',
                importFromIndex: indexName
            }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: boolean } = {};
        if (!newIndex.name) newErrors.name = true;
        if (!newIndex.totalRetention) newErrors.totalRetention = true;
        if (!newIndex.coldRetention) newErrors.coldRetention = true;
        if (parseInt(newIndex.coldRetention) > parseInt(newIndex.totalRetention)) newErrors.coldRetention = true;
        if (newIndex.inputType !== 'import' && !newIndex.docSize) newErrors.docSize = true;
        if (newIndex.inputType === 'frequency' && !newIndex.frequency) newErrors.frequency = true;
        if (newIndex.inputType === 'avgDocs' && !newIndex.avgDocs) newErrors.avgDocs = true;
        if (newIndex.inputType === 'import' && !newIndex.importFromIndex) newErrors.importFromIndex = true;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            let rates;
            if (newIndex.inputType === 'import') {
                const importedIndex = indices.find(index => index.name === newIndex.importFromIndex);
                if (!importedIndex) {
                    throw new Error(`Imported index '${newIndex.importFromIndex}' not found`);
                }
                const { elasticStoragePerHotTierDay, elasticStoragePerColdTierDay, S3StoragePerColdTierDay } = importedIndex;
                rates = { elasticStoragePerHotTierDay, elasticStoragePerColdTierDay, S3StoragePerColdTierDay };
            } else {
                rates = calculateRates(Number(newIndex.docSize), Number(newIndex.frequency), Number(newIndex.avgDocs), newIndex.inputType);
            }

            const hotRetentionDays = Number(newIndex.totalRetention) - Number(newIndex.coldRetention);
            const coldRetentionDays = Number(newIndex.coldRetention);

            const newIndexData = {
                name: newIndex.name,
                hebrewName: newIndex.name,
                elasticStoragePerHotTierDay: rates.elasticStoragePerHotTierDay,
                S3StoragePerColdTierDay: rates.S3StoragePerColdTierDay,
                elasticStoragePerColdTierDay: rates.elasticStoragePerColdTierDay,
                hotRetentionDays,
                coldRetentionDays,
                elasticStorage: rates.elasticStoragePerHotTierDay * hotRetentionDays + rates.elasticStoragePerColdTierDay * coldRetentionDays,
                S3Storage: rates.S3StoragePerColdTierDay * coldRetentionDays,
                totalRetentionDays: hotRetentionDays + coldRetentionDays,
                initialHotRetentionDays: hotRetentionDays,
                initialColdRetentionDays: coldRetentionDays,
                indexNamesByTier: { hotTier: [], coldTier: [] }
            };

            handleAddIndex(newIndexData);
        }
    };

    const inputTypes = [
        { value: 'frequency', label: t.docFrequency },
        { value: 'avgDocs', label: t.avgDocs },
        { value: 'import', label: t.importFromIndex }
    ];

    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t.addIndex}</h2>
            <div className="space-y-4">
                {/* Index Name Area */}
                <div>
                    <label className="text-sm font-medium text-gray-800">{t.indexName}</label>
                    <input
                        type="text"
                        value={newIndex.name || ''}
                        onChange={(e) => setNewIndex(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.name ? 'border-red-500' : ''}`}
                        placeholder={t.indexNamePlaceholder}
                    />
                </div>
                <div className="pb-4 border-b"></div>
                {/* Storage Per Day Area */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="mb-3">
                        <label className="text-sm font-medium text-gray-800">{t.selectInputType}</label>
                        <select
                            value={newIndex.inputType}
                            onChange={(e) => setNewIndex(prev => ({ ...prev, inputType: e.target.value as NewIndexInputType }))}
                            className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                            {inputTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    {newIndex.inputType === 'import' && (
                        <div>
                            <label className="text-sm font-medium text-gray-800">{t.importFromIndex}</label>
                            <select
                                onChange={(e) => handleImportFromIndex(e.target.value)}
                                className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.importFromIndex ? 'border-red-500' : ''}`}
                                aria-placeholder={t.importFromIndexPlaceholder}
                            >
                                <option value="">{t.importFromIndexPlaceholder}</option>
                                {indices.map(index => (
                                    <option key={index.name} value={index.name}>
                                        {translateIndexNames ? index.hebrewName : index.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {newIndex.inputType !== 'import' && (
                        <>
                            <div>
                                <label className="text-sm font-medium text-gray-800">{t.avgDocSize}</label>
                                <input
                                    type="number"
                                    value={newIndex.docSize || ''}
                                    onChange={(e) => setNewIndex(prev => ({ ...prev, docSize: e.target.value }))}
                                    className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.docSize ? 'border-red-500' : ''}`}
                                    placeholder="100"
                                />
                            </div>
                            {newIndex.inputType === 'frequency' ? (
                                <div>
                                    <label className="text-sm font-medium text-gray-800">{t.docFrequency} ({t.perSecond})</label>
                                    <input
                                        type="number"
                                        value={newIndex.frequency || ''}
                                        onChange={(e) => setNewIndex(prev => ({ ...prev, frequency: e.target.value }))}
                                        className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.frequency ? 'border-red-500' : ''}`}
                                        placeholder="100"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="text-sm font-medium text-gray-800">{t.avgDocs}</label>
                                    <input
                                        type="number"
                                        value={newIndex.avgDocs || ''}
                                        onChange={(e) => setNewIndex(prev => ({ ...prev, avgDocs: e.target.value }))}
                                        className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.avgDocs ? 'border-red-500' : ''}`}
                                        placeholder="1000000"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className="pb-4 border-b"></div>
                {/* Retention Periods Area */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-800">{t.totalRetentionPeriod} ({t.days})</label>
                        <input
                            type="number"
                            value={newIndex.totalRetention || ''}
                            onChange={(e) => setNewIndex(prev => ({ ...prev, totalRetention: e.target.value }))}
                            className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.totalRetention ? 'border-red-500' : ''}`}
                            placeholder="60"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-800">{t.coldTierRetentionQuestion} ({t.days})</label>
                        <input
                            type="number"
                            value={newIndex.coldRetention || ''}
                            onChange={(e) => handleColdRetentionChange(e.target.value)}
                            className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.coldRetention ? 'border-red-500' : ''}`}
                            placeholder="15"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={() => setShowAddIndex(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {t.cancel}
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-blue-600 hover:bg-blue-700"
                    >
                        {t.addIndexButton}
                    </button>
                </div>
            </div>
        </div>
    );
};
