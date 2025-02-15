import React from 'react';
import { Translation, IndexData, NewIndex } from './models';

interface AddIndexForm {
    t: Translation;
    newIndex: NewIndex;
    setNewIndex: React.Dispatch<React.SetStateAction<NewIndex>>;
    setShowAddIndex: React.Dispatch<React.SetStateAction<boolean>>;
    handleAddIndex: () => void;
    indices: IndexData[];
}

const AddIndexForm: React.FC<AddIndexForm> = ({ t, newIndex, setNewIndex, setShowAddIndex, handleAddIndex, indices }) => {
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
                        className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder={t.indexNamePlaceholder}
                    />
                </div>
                <div className="pb-4 border-b"></div>
                {/* Storage Per Day Area */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={() => setNewIndex(prev => ({ ...prev, inputType: 'frequency' }))}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                                ${newIndex.inputType === 'frequency'
                                    ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-700/20'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {t.docFrequency}
                        </button>
                        <button
                            onClick={() => setNewIndex(prev => ({ ...prev, inputType: 'avgDocs' }))}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                                ${newIndex.inputType === 'avgDocs'
                                    ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-700/20'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {t.avgDocs}
                        </button>
                        <button
                            onClick={() => setNewIndex(prev => ({ ...prev, inputType: 'import' }))}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                                ${newIndex.inputType === 'import'
                                    ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-700/20'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {t.importFromIndex}
                        </button>
                    </div>
                    {newIndex.inputType === 'import' && (
                        <div>
                            <label className="text-sm font-medium text-gray-800">{t.importFromIndex}</label>
                            <select
                                onChange={(e) => handleImportFromIndex(e.target.value)}
                                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                aria-placeholder={t.importFromIndexPlaceholder}
                            >
                                <option value="">{t.importFromIndexPlaceholder}</option>
                                {indices.map(index => (
                                    <option key={index.name} value={index.name}>{index.name}</option>
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
                                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                                        className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                                        className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                            className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="60"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-800">{t.coldTierRetention} ({t.days})</label>
                        <input
                            type="number"
                            value={newIndex.coldRetention || ''}
                            onChange={(e) => handleColdRetentionChange(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                        onClick={handleAddIndex}
                        disabled={!newIndex.name || !newIndex.totalRetention || !newIndex.coldRetention}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${!newIndex.name || !newIndex.totalRetention || !newIndex.coldRetention
                            ? 'bg-blue-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {t.addIndexButton}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddIndexForm;
