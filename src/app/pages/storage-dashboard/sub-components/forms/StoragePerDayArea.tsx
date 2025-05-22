import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SourceGroup, Translation, StoragePerDayInputType } from '../../models';
import { convert } from '../../../../utils';
import { config } from '../../../../../config';

const DAILY_SECONDS = 86400;

interface StoragePerDayAreaProps {
    t: Translation;
    errors: { [key: string]: boolean };
    sourceGroups: SourceGroup[];
    translateNames: boolean;
    onStorageRatesChange: (rates: { elasticStoragePerHotTierDay: number; elasticStoragePerColdTierDay: number; S3StoragePerColdTierDay: number }) => void;
    defaultImportFrom?: string;
    availableInputTypes?: StoragePerDayInputType[];
    defaultInputType?: StoragePerDayInputType;
}

export const StoragePerDayArea: React.FC<StoragePerDayAreaProps> = ({ t, errors, sourceGroups, translateNames, onStorageRatesChange, defaultImportFrom, availableInputTypes, defaultInputType }) => {
    const [storageValues, setStorageValues] = useState({
        docSize: '',
        frequency: '',
        avgDocs: '',
        inputType: defaultInputType || 'import' as StoragePerDayInputType,
        importFromSourceGroup: defaultImportFrom || ''
    });

    const inputTypes = [
        { value: 'import', label: t.importFromSourceGroup },
        { value: 'avgDocsPerSecond', label: t.avgDocsPerSecond },
        { value: 'avgDocsPerDay', label: t.avgDocsPerDay },
    ].filter(type => !availableInputTypes || availableInputTypes.includes(type.value as StoragePerDayInputType));

    const handleChange = (values: Partial<typeof storageValues>) => {
        setStorageValues(prev => ({ ...prev, ...values }));
    };

    const memoizedOnStorageRatesChange = useCallback(onStorageRatesChange, []);

    const prevRatesRef = useRef<{ elasticStoragePerHotTierDay: number; elasticStoragePerColdTierDay: number; S3StoragePerColdTierDay: number } | null>(null);

    useEffect(() => {
        let rates;
        if (storageValues.inputType === 'import') {
            const importedSourceGroup = sourceGroups.find(sourceGroup => sourceGroup.name === storageValues.importFromSourceGroup);
            if (importedSourceGroup) {
                rates = {
                    elasticStoragePerHotTierDay: importedSourceGroup.elasticStoragePerHotTierDay,
                    elasticStoragePerColdTierDay: importedSourceGroup.elasticStoragePerColdTierDay,
                    S3StoragePerColdTierDay: importedSourceGroup.S3StoragePerColdTierDay
                };
            }
        } else if (storageValues.inputType === 'avgDocsPerSecond') {
            const GBPerSecond = convert.kbToGB(Number(storageValues.docSize)) * Number(storageValues.frequency);
            rates = {
                elasticStoragePerHotTierDay: GBPerSecond * DAILY_SECONDS,
                elasticStoragePerColdTierDay: GBPerSecond * DAILY_SECONDS * config.elasticColdTierMultiplier,
                S3StoragePerColdTierDay: GBPerSecond * DAILY_SECONDS * config.elasticColdTierMultiplier * config.s3ColdTierMultiplier
            };
        } else {
            const GBPerDay = convert.kbToGB(Number(storageValues.docSize)) * Number(storageValues.avgDocs);
            rates = {
                elasticStoragePerHotTierDay: GBPerDay,
                elasticStoragePerColdTierDay: GBPerDay * config.elasticColdTierMultiplier,
                S3StoragePerColdTierDay: GBPerDay * config.elasticColdTierMultiplier * config.s3ColdTierMultiplier
            };
        }

        if (rates) {
            const prevRates = prevRatesRef.current;
            if (
                !prevRates ||
                prevRates.elasticStoragePerHotTierDay !== rates.elasticStoragePerHotTierDay ||
                prevRates.elasticStoragePerColdTierDay !== rates.elasticStoragePerColdTierDay ||
                prevRates.S3StoragePerColdTierDay !== rates.S3StoragePerColdTierDay
            ) {
                prevRatesRef.current = rates; // Update the ref with new rates
                memoizedOnStorageRatesChange(rates); // Call the callback only if rates have changed
            }
        }
    }, [
        storageValues.inputType,
        storageValues.docSize,
        storageValues.frequency,
        storageValues.avgDocs,
        storageValues.importFromSourceGroup,
        sourceGroups,
        memoizedOnStorageRatesChange
    ]);

    return (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="mb-3">
                <select
                    value={storageValues.inputType}
                    onChange={(e) => handleChange({ inputType: e.target.value as StoragePerDayInputType })}
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
                    <label className="text-sm font-medium text-gray-800">{t.importFromSourceGroup}</label>
                    <select
                        onChange={(e) => handleChange({ importFromSourceGroup: e.target.value })}
                        className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${errors.importFromSourceGroup ? 'border-red-500' : ''}`}
                        aria-placeholder={t.importFromSourceGroupPlaceholder}
                        value={storageValues.importFromSourceGroup}
                    >
                        <option value="">{t.importFromSourceGroupPlaceholder}</option>
                        {sourceGroups.map(sourceGroup => (
                            <option key={sourceGroup.name} value={sourceGroup.name}>
                                {translateNames ? sourceGroup.hebrewName : sourceGroup.name}
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
                    {storageValues.inputType === 'avgDocsPerSecond' ? (
                        <div>
                            <label className="text-sm font-medium text-gray-800">{t.avgDocsPerSecond}</label>
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
                            <label className="text-sm font-medium text-gray-800">{t.avgDocsPerDay}</label>
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
