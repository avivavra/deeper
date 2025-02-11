import React from 'react';

interface AddIndexModalProps {
    t: any;
    newIndex: {
        name: string;
        docSize: string;
        frequency: string;
        avgDocs: string;
        inputType: 'frequency' | 'avgDocs';
    };
    setNewIndex: React.Dispatch<React.SetStateAction<{
        name: string;
        docSize: string;
        frequency: string;
        avgDocs: string;
        inputType: 'frequency' | 'avgDocs';
    }>>;
    setShowAddIndex: React.Dispatch<React.SetStateAction<boolean>>;
    handleAddIndex: () => void;
}

const AddIndexModal: React.FC<AddIndexModalProps> = ({ t, newIndex, setNewIndex, setShowAddIndex, handleAddIndex }) => {
    return (
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
    );
};

export default AddIndexModal;
