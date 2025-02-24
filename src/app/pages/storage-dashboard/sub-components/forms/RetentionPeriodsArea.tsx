import React from 'react';
import { Translation } from '../../models';
import { NewIndex } from './AddIndexForm';

interface RetentionPeriodsAreaProps {
    t: Translation;
    newIndex: NewIndex;
    setNewIndex: React.Dispatch<React.SetStateAction<NewIndex>>;
    errors: { [key: string]: boolean };
    handleColdRetentionChange: (value: string) => void;
}

export const RetentionPeriodsArea: React.FC<RetentionPeriodsAreaProps> = ({ t, newIndex, setNewIndex, errors, handleColdRetentionChange }) => (
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
);
