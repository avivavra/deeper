import React from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import GenericDropdown from '../../components/GenericDropdown';
import CustomSlider from './CustomSlider';

type IndexRetentionManagementProps = {
    isEditMode: boolean;
    filteredIndices: any[];
    audience: 'developer' | 'user';
    t: any;
    handleTotalRetentionChange: (indexName: string, newTotalDays: number) => void;
    handleRetentionChange: (indexName: string, newHotDays: number, newColdDays: number) => void;
    handleRemoveIndex: (indexName: string) => void;
    setShowAddIndex: (show: boolean) => void;
    showAddIndex: boolean;
    newIndex: { name: string; docSize: string; frequency: string; avgDocs: string; inputType: 'frequency' | 'avgDocs' };
    setNewIndex: (newIndex: any) => void;
    handleAddIndex: () => void;
};

const IndexRetentionManagement = ({
    isEditMode,
    filteredIndices,
    audience,
    t,
    handleTotalRetentionChange,
    handleRetentionChange,
    handleRemoveIndex,
    setShowAddIndex,
    showAddIndex,
    newIndex,
    setNewIndex,
    handleAddIndex
}: IndexRetentionManagementProps) => {
    return (
        <div className={`bg-white rounded-lg shadow-sm ${isEditMode ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">{t.indexRetentionManagement}</h2>
                    {isEditMode && (
                        <button
                            onClick={() => setShowAddIndex(true)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Plus className="h-4 w-4 mx-2 text-gray-800" />
                            {t.addIndex}
                        </button>
                    )}
                </div>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredIndices.map(index => (
                            <div key={index.name} className="bg-gray-50 p-4 rounded-lg border relative">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-800">{audience === 'developer' ? index.name : index.hebrewName}</h3>
                                    {isEditMode && (
                                        <div className="relative">
                                            <GenericDropdown
                                                buttonLabel={<MoreVertical className="h-4 w-4 text-gray-800" />}
                                                options={[
                                                    { label: t.removeIndex, value: 'remove' }
                                                ]}
                                                onSelect={() => handleRemoveIndex(index.name)}
                                                width="w-40"
                                                type="button"
                                                showChevron={false}
                                            />
                                        </div>
                                    )}
                                </div>

                                {isEditMode ? (
                                    audience === 'user' ? (
                                        <div className="space-y-2 mt-4">
                                            <div className="flex justify-between text-sm text-gray-800">
                                                <span>{t.totalRetentionPeriod}</span>
                                                <span>{index.totalRetentionDays}</span>
                                            </div>
                                            <CustomSlider
                                                value={[index.totalRetentionDays]}
                                                min={1}
                                                max={270}
                                                onChange={(value) => handleTotalRetentionChange(index.name, value[0])}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-2 mt-4">
                                                <div className="flex justify-between text-sm text-gray-800">
                                                    <span>{t.hotTierRetention}</span>
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
                                                    <span>{t.coldTierRetention}</span>
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
                                    )
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        {audience === 'developer' && (
                                            <>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-800">{t.hotTierRetention}:</span>
                                                    <span className="text-sm ml-2 text-gray-800">{index.hotRetentionDays} {t.days}</span>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-800">{t.coldTierRetention}:</span>
                                                    <span className="text-sm ml-2 text-gray-800">{index.coldRetentionDays} {t.days}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between text-sm font-bold text-gray-800 mt-4">
                                    <span>{t.totalRetentionPeriod}</span>
                                    <span>{index.totalRetentionDays} {t.days}</span>
                                </div>

                                {audience === 'user' ? (
                                    <div className="flex justify-between text-sm text-gray-800 mt-4">
                                        <span>{t.storage}</span>
                                        <span dir='ltr'>{index.elasticStorageGB + index.S3StorageGB} GB</span>
                                    </div>
                                ) : (
                                    <div className="text-sm space-x-4 mt-4">
                                        <span className="text-gray-800">Elasticsearch: {index.elasticStorageGB} GB</span>
                                        <span className="text-gray-800">S3: {index.S3StorageGB} GB</span>
                                        <span className="text-gray-500">
                                            ({index.elasticStoragePerHotTierDay.toFixed(2)}GB/day hot, {index.S3StoragePerColdTierDay.toFixed(2)}GB/day cold)
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IndexRetentionManagement;
