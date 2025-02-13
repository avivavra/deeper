import React from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import GenericDropdown from '../../components/GenericDropdown';
import CustomSlider from './CustomSlider';
import Tooltip from '../../components/Tooltip'; // Import Tooltip component
import TooltipIcon from '../../components/TooltipIcon'; // Import TooltipIcon component

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
    newIndex: { name: string; docSize: string; frequency: string; avgDocs: string; inputType: NewIndexInputType };
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
                                                resetKey={`total-${index.name}-${index.totalRetentionDays}`} // Update to resetKey
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
                                                    resetKey={`hot-${index.name}-${index.hotRetentionDays}`} // Update to resetKey
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
                                                    resetKey={`cold-${index.name}-${index.coldRetentionDays}`} // Update to resetKey
                                                    value={[index.coldRetentionDays]}
                                                    min={0}
                                                    max={180}
                                                    onChange={(value) => handleRetentionChange(index.name, index.hotRetentionDays, value[0])}
                                                />
                                            </div>
                                        </>
                                    )
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 mt-2 mb-4">
                                        {audience === 'developer' && (
                                            <>
                                                <div className="flex justify-between text-sm text-gray-800">
                                                    <span className="text-left">{t.hotTierRetention}</span>
                                                    <span className="text-right">{index.hotRetentionDays} {t.days}</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-800">
                                                    <span className="text-left">{t.coldTierRetention}</span>
                                                    <span className="text-right">{index.coldRetentionDays} {t.days}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {audience === 'developer' && (
                                    <>
                                        <div className="grid grid-cols-1 gap-4 mt-2">
                                            <div className="flex justify-between text-sm font-bold text-gray-800">
                                                <span>{t.totalRetentionPeriod}</span>
                                                <span>{index.totalRetentionDays} {t.days}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-800">
                                                <span className="text-left">Elasticsearch</span>
                                                <span className="text-right">
                                                    {index.elasticStorageGB} GB
                                                    <TooltipIcon content={`Hot: ${index.elasticStoragePerHotTierDay.toFixed(2)}GB/day, Cold: ${index.elasticStoragePerColdTierDay.toFixed(2)}GB/day`} alignment="left" />
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-800">
                                                <span className="text-left">S3</span>
                                                <span className="text-right">
                                                    {index.S3StorageGB} GB
                                                    <TooltipIcon content={`Cold: ${index.S3StoragePerColdTierDay.toFixed(2)}GB/day`} alignment="left" />
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {audience === 'user' && (
                                    <>
                                        <div className="flex justify-between text-sm font-bold text-gray-800 mt-4">
                                            <span>{t.totalRetentionPeriod}</span>
                                            <span>{index.totalRetentionDays} {t.days}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-800 mt-4">
                                            <span>{t.storage}</span>
                                            <span dir='ltr'>{index.elasticStorageGB + index.S3StorageGB} GB</span>
                                        </div>
                                    </>
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
