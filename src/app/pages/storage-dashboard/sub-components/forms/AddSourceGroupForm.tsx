import React, { useState } from 'react';
import { SourceGroup, Translation, StoragePerDayInputType } from '../../models';
import { NameArea } from './NameArea';
import { StoragePerDayArea } from './StoragePerDayArea';
import { RetentionPeriodsArea } from './RetentionPeriodsArea';

const emptyNewSourceGroup = (): NewSourceGroup => ({
    name: '',
    docSize: '',
    frequency: '',
    avgDocs: '',
    inputType: 'frequency',
    totalRetention: '',
    coldRetention: '',
    importFromSourceGroup: ''
});

export type NewSourceGroup = {
    name: string;
    docSize: string;
    frequency: string;
    avgDocs: string;
    inputType: StoragePerDayInputType;
    totalRetention: string;
    coldRetention: string;
    importFromSourceGroup: string;
};

interface AddSourceGroupForm {
    t: Translation;
    setShowAddSourceGroup: React.Dispatch<React.SetStateAction<boolean>>;
    handleAddSourceGroup: (newSourceGroupData: SourceGroup) => void;
    sourceGroups: SourceGroup[];
    translateNames: boolean;
}

export const AddSourceGroupForm: React.FC<AddSourceGroupForm> = ({ t, setShowAddSourceGroup, handleAddSourceGroup: handleAddSourceGroup, sourceGroups, translateNames }) => {
    const [newSourceGroup, setNewSourceGroup] = useState<NewSourceGroup>(emptyNewSourceGroup());
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
    const [storageRates, setStorageRates] = useState({
        elasticStoragePerHotTierDay: 0,
        elasticStoragePerColdTierDay: 0,
        S3StoragePerColdTierDay: 0
    });

    const handleColdRetentionChange = (value: string) => {
        if (parseInt(value) > parseInt(newSourceGroup.totalRetention)) {
            setNewSourceGroup(prev => ({ ...prev, coldRetention: newSourceGroup.totalRetention }));
        } else {
            setNewSourceGroup(prev => ({ ...prev, coldRetention: value }));
        }
    };

    const handleStorageRatesChange = (rates: typeof storageRates) => {
        setStorageRates(rates);
    };

    const validateForm = () => {
        const newErrors: { [key: string]: boolean } = {};
        if (!newSourceGroup.name) newErrors.name = true;
        if (!newSourceGroup.totalRetention) newErrors.totalRetention = true;
        if (!newSourceGroup.coldRetention) newErrors.coldRetention = true;
        if (parseInt(newSourceGroup.coldRetention) > parseInt(newSourceGroup.totalRetention)) newErrors.coldRetention = true;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            const hotRetentionDays = Number(newSourceGroup.totalRetention) - Number(newSourceGroup.coldRetention);
            const coldRetentionDays = Number(newSourceGroup.coldRetention);

            const newSourceGroupData = {
                name: newSourceGroup.name,
                hebrewName: newSourceGroup.name,
                elasticStoragePerHotTierDay: storageRates.elasticStoragePerHotTierDay,
                S3StoragePerColdTierDay: storageRates.S3StoragePerColdTierDay,
                elasticStoragePerColdTierDay: storageRates.elasticStoragePerColdTierDay,
                hotRetentionDays,
                coldRetentionDays,
                elasticStorage: storageRates.elasticStoragePerHotTierDay * hotRetentionDays + storageRates.elasticStoragePerColdTierDay * coldRetentionDays,
                S3Storage: storageRates.S3StoragePerColdTierDay * coldRetentionDays,
                totalRetentionDays: hotRetentionDays + coldRetentionDays,
                initialHotRetentionDays: hotRetentionDays,
                initialColdRetentionDays: coldRetentionDays,
                indexNamesByTier: { hotTier: [], coldTier: [] },
            };

            handleAddSourceGroup(newSourceGroupData);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t.addSourceGroup}</h2>
            <div className="space-y-4">
                <NameArea
                    label={t.sourceGroupName}
                    value={newSourceGroup.name}
                    onChange={(e) => setNewSourceGroup(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t.sourceGroupNamePlaceholder}
                    error={errors.name}
                />
                <div className="pb-4 border-b"></div>
                <StoragePerDayArea
                    t={t}
                    errors={errors}
                    sourceGroups={sourceGroups}
                    translateNames={translateNames}
                    onStorageRatesChange={handleStorageRatesChange}
                />
                <div className="pb-4 border-b"></div>
                <RetentionPeriodsArea t={t} newSourceGroup={newSourceGroup} setNewSourceGroup={setNewSourceGroup} errors={errors} handleColdRetentionChange={handleColdRetentionChange} />
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={() => setShowAddSourceGroup(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {t.cancel}
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-blue-600 hover:bg-blue-700"
                    >
                        {t.addSourceGroupButton}
                    </button>
                </div>
            </div>
        </div>
    );
};
