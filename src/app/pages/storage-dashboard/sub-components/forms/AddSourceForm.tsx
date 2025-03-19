import React, { useState } from 'react';
import { SourceGroup, Source, Translation } from '../../models';
import { StoragePerDayArea } from './StoragePerDayArea';
import { NameArea } from './NameArea';

const emptyNewSource = (): NewSource => ({
    name: '',
    docSize: '',
    frequency: '',
    avgDocs: '',
    inputType: 'avgDocsPerSecond',
    importFromSourceGroup: ''
});

export type NewSource = {
    name: string;
    docSize: string;
    frequency: string;
    avgDocs: string;
    inputType: string;
    importFromSourceGroup: string;
};

interface AddSourceForm {
    t: Translation;
    setShowAddSource: React.Dispatch<React.SetStateAction<boolean>>;
    handleAddSource: (newSourceData: Source) => void;
    sourceGroups: SourceGroup[];
    relatedSourceGroup: SourceGroup;
    translateNames: boolean;
}

export const AddSourceForm: React.FC<AddSourceForm> = ({ t, setShowAddSource, handleAddSource, sourceGroups, relatedSourceGroup, translateNames }) => {
    const [newSource, setNewSource] = useState<NewSource>(emptyNewSource());
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
    const [storageRates, setStorageRates] = useState({
        elasticStoragePerHotTierDay: 0,
        elasticStoragePerColdTierDay: 0,
        S3StoragePerColdTierDay: 0
    });

    const handleStorageRatesChange = (rates: typeof storageRates) => {
        setStorageRates(rates);
    };

    const validateForm = () => {
        const newErrors: { [key: string]: boolean } = {};
        if (!newSource.name) newErrors.name = true;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            const elasticStorage = storageRates.elasticStoragePerHotTierDay * relatedSourceGroup.hotRetentionDays +
                storageRates.elasticStoragePerColdTierDay * relatedSourceGroup.coldRetentionDays;

            const S3Storage = storageRates.S3StoragePerColdTierDay * relatedSourceGroup.coldRetentionDays;

            const newSourceData: Source = {
                name: newSource.name,
                elasticStoragePerHotTierDay: storageRates.elasticStoragePerHotTierDay,
                S3StoragePerColdTierDay: storageRates.S3StoragePerColdTierDay,
                elasticStoragePerColdTierDay: storageRates.elasticStoragePerColdTierDay,
                elasticStorage,
                S3Storage,
                relatedSourceGroup: relatedSourceGroup.name
            };

            handleAddSource(newSourceData);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t.addSource}</h2>
            <div className="space-y-4">
                <NameArea
                    label={t.sourceName}
                    value={newSource.name}
                    onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t.sourceNamePlaceholder}
                    error={errors.name}
                />
                <div className="pb-4 border-b"></div>
                <StoragePerDayArea
                    t={t}
                    errors={errors}
                    sourceGroups={sourceGroups}
                    translateNames={translateNames}
                    onStorageRatesChange={handleStorageRatesChange}
                    defaultImportFrom={relatedSourceGroup.name}
                    availableInputTypes={['avgDocsPerSecond', 'avgDocsPerDay']}
                    defaultInputType="frequency"
                />
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={() => setShowAddSource(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {t.cancel}
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-blue-600 hover:bg-blue-700"
                    >
                        {t.addSourceButton}
                    </button>
                </div>
            </div>
        </div>
    );
};
