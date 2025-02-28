import React from 'react';
import { Translation } from '../../models';
import { NewSourceGroup } from './AddSourceGroupForm';

interface RetentionPeriodsAreaProps {
    t: Translation;
    newSourceGroup: NewSourceGroup;
    setNewSourceGroup: React.Dispatch<React.SetStateAction<NewSourceGroup>>;
    errors: { [key: string]: boolean };
    handleColdRetentionChange: (value: string) => void;
}

export const RetentionPeriodsArea: React.FC<RetentionPeriodsAreaProps> = ({ t, newSourceGroup: newSourceGroup, setNewSourceGroup, errors, handleColdRetentionChange }) => (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div>
            <label className="text-sm font-medium text-gray-800">{t.totalRetentionPeriod} ({t.days})</label>
            <input
                type="number"
                value={newSourceGroup.totalRetention || ''}
                onChange={(e) => setNewSourceGroup(prev => ({ ...prev, totalRetention: e.target.value }))}
                className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 ${errors.totalRetention ? 'border-red-500' : ''}`}
                placeholder="60"
            />
        </div>
        <div>
            <label className="text-sm font-medium text-gray-800">{t.coldTierRetentionQuestion} ({t.days})</label>
            <input
                type="number"
                value={newSourceGroup.coldRetention || ''}
                onChange={(e) => handleColdRetentionChange(e.target.value)}
                className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 ${errors.coldRetention ? 'border-red-500' : ''}`}
                placeholder="15"
            />
        </div>
    </div>
);
