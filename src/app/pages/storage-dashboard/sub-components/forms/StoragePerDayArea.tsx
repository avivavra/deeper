import React, { useState, useEffect, useCallback } from 'react';
import { IndexData, Translation, NewIndexInputType } from '../../models';
import { convertKBToGB } from '../../../../utils';
import { config } from '../../../../../config';

const DAILY_SECONDS = 86400;

interface StoragePerDayAreaProps {
    t: Translation;
    errors: { [key: string]: boolean };
    indices: IndexData[];
    translateIndexNames: boolean;
    onStorageRatesChange: (rates: { elasticStoragePerHotTierDay: number; elasticStoragePerColdTierDay: number; S3StoragePerColdTierDay: number }) => void;
}

export const StoragePerDayArea: React.FC<StoragePerDayAreaProps> = ({ t, errors, indices, translateIndexNames, onStorageRatesChange }) => {
    const [storageValues, setStorageValues] = useState({
        docSize: '',
        frequency: '',
        avgDocs: '',
        inputType: 'frequency' as NewIndexInputType,
        importFromIndex: ''
    });

    const inputTypes = [
        { value: 'frequency', label: t.docFrequency },
        { value: 'avgDocs', label: t.avgDocs },
        { value: 'import', label: t.importFromIndex }
    ];

    const handleChange = (values: Partial<typeof storageValues>) => {
        setStorageValues(prev => ({ ...prev, ...values }));
    };

    const memoizedOnStorageRatesChange = useCallback(onStorageRatesChange, []);

    useEffect(() => {
        let rates;
        if (storageValues.inputType === 'import') {
            const importedIndex = indices.find(index => index.name === storageValues.importFromIndex);
            if (importedIndex) {
                rates = {
                    elasticStoragePerHotTierDay: importedIndex.elasticStoragePerHotTierDay,
                    elasticStoragePerColdTierDay: importedIndex.elasticStoragePerColdTierDay,
                    S3StoragePerColdTierDay: importedIndex.S3StoragePerColdTierDay
                };
            }
        } else if (storageValues.inputType === 'frequency') {
            const GBPerSecond = convertKBToGB(Number(storageValues.docSize)) * Number(storageValues.frequency);
            rates = {
                elasticStoragePerHotTierDay: GBPerSecond * DAILY_SECONDS,
                elasticStoragePerColdTierDay: GBPerSecond * DAILY_SECONDS * config.s3ColdTierMultiplier,
                S3StoragePerColdTierDay: GBPerSecond * DAILY_SECONDS * config.elasticColdTierMultiplier
            };
        } else {
            const GBPerDay = convertKBToGB(Number(storageValues.docSize)) * Number(storageValues.avgDocs);
            rates = {
                elasticStoragePerHotTierDay: GBPerDay,
                elasticStoragePerColdTierDay: GBPerDay * config.s3ColdTierMultiplier,
                S3StoragePerColdTierDay: GBPerDay * config.elasticColdTierMultiplier
            };
        }
        if (rates) {
            memoizedOnStorageRatesChange(rates);
        }
    }, [storageValues, indices, memoizedOnStorageRatesChange]);

    return (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="mb-3">
                <select
                    value={storageValues.inputType}
                    onChange={(e) => handleChange({ inputType: e.target.value as NewIndexInputType })}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                    {inputTypes.map(type => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>
            {storageValues.inputType === 'import' && (
                <div>
                    <label className="text-sm font-medium text-gray-800">{t.importFromIndex}</label>
                    <select
                        onChange={(e) => handleChange({ importFromIndex: e.target.value })}
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
            {storageValues.inputType !== 'import' && (
                <>
                    <div>
                        <label className="text-sm font-medium text-gray-800">{t.avgDocSize}</label>
                        <input
                            type="number"
                            value={storageValues.docSize || ''}
                            onChange={(e) => handleChange({ docSize: e.target.value })}
                            className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.docSize ? 'border-red-500' : ''}`}
                            placeholder="0.1"
                        />
                    </div>
                    {storageValues.inputType === 'frequency' ? (
                        <div>
                            <label className="text-sm font-medium text-gray-800">{t.docFrequency} ({t.perSecond})</label>
                            <input
                                type="number"
                                value={storageValues.frequency || ''}
                                onChange={(e) => handleChange({ frequency: e.target.value })}
                                className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.frequency ? 'border-red-500' : ''}`}
                                placeholder="100"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="text-sm font-medium text-gray-800">{t.avgDocs}</label>
                            <input
                                type="number"
                                value={storageValues.avgDocs || ''}
                                onChange={(e) => handleChange({ avgDocs: e.target.value })}
                                className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.avgDocs ? 'border-red-500' : ''}`}
                                placeholder="1000000"
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
