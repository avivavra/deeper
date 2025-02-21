import React from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import GenericDropdown from '../../../components/GenericDropdown';
import CustomSlider from '../../../components/CustomSlider';
import TooltipIcon from '../../../components/TooltipIcon';
import { IndexData } from '../models/cluster-models';
import { Direction, DisplayMethod, Translation } from '../models/display-models';

type IndexRetentionManagementProps = {
    isEditMode: boolean;
    filteredIndices: IndexData[];
    direction: Direction;
    displayMethod: DisplayMethod;
    t: Translation;
    displayRates: boolean;
    handleTotalRetentionChange: (indexName: string, newTotalDays: number) => void;
    handleIndexRetentionChange: (indexName: string, newHotDays: number, newColdDays: number, newElasticStorage: number, newS3Storage: number) => void;
    handleRemoveIndex: (indexName: string) => void;
    setShowAddIndex: (show: boolean) => void;
    showAddIndex: boolean;
};

const IndexRetentionManagement = ({
    isEditMode,
    filteredIndices,
    direction,
    displayMethod,
    t,
    displayRates,
    handleTotalRetentionChange,
    handleIndexRetentionChange,
    handleRemoveIndex,
    setShowAddIndex,
}: IndexRetentionManagementProps) => {

    const handleRetentionChange = (indexName: string, newHotDays: number, newColdDays: number) => {
        const index = filteredIndices.find(i => i.name === indexName);
        if (!index) return;

        const hotDaysDiff = newHotDays - index.hotRetentionDays;
        const coldDaysDiff = newColdDays - index.coldRetentionDays;

        const newElasticStorage = index.elasticStorageGB + (index.elasticStoragePerHotTierDay * hotDaysDiff) + (index.elasticStoragePerColdTierDay * coldDaysDiff);
        const newS3Storage = index.S3StorageGB + (index.S3StoragePerColdTierDay * coldDaysDiff);

        handleIndexRetentionChange(indexName, newHotDays, newColdDays, newElasticStorage, newS3Storage);
    };

    return (
        <div>
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
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {direction === 'ltr' ? index.name : index.hebrewName}
                                        {displayRates && (
                                            <TooltipIcon
                                                content={index.indices.length > 0 ? index.indices.join('\n') : "No Indices"}
                                                alignment={direction === 'rtl' ? 'right' : 'left'}
                                            />
                                        )}
                                    </h3>
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
                                    displayMethod === 'combined' ? (
                                        <div className="space-y-2 mt-4">
                                            <div className="flex justify-between text-sm text-gray-800">
                                                <span>{t.totalRetentionPeriod}</span>
                                                <span>{index.totalRetentionDays}</span>
                                            </div>
                                            <CustomSlider
                                                resetKey={`total-${index.name}-${index.totalRetentionDays}`}
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
                                                    resetKey={`hot-${index.name}-${index.hotRetentionDays}`}
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
                                                    resetKey={`cold-${index.name}-${index.coldRetentionDays}`}
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
                                        {displayMethod === 'separate' && (
                                            <>
                                                <div className="flex justify-between text-sm text-gray-800">
                                                    <span className="text-left">{t.hotTierRetention}</span>
                                                    <span className="text-right">{index.hotRetentionDays} {t.day}</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-800">
                                                    <span className="text-left">{t.coldTierRetention}</span>
                                                    <span className="text-right">{index.coldRetentionDays} {t.day}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {displayMethod === 'separate' && (
                                    <>
                                        <div className="grid grid-cols-1 gap-4 mt-2">
                                            <div className="flex justify-between text-sm font-bold text-gray-800">
                                                <span>{t.totalRetentionPeriod}</span>
                                                <span>{index.totalRetentionDays} {t.day}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-800">
                                                <span className="text-left">{t.elasticsearchStorage}</span>
                                                <span className="text-right">
                                                    <span dir='ltr'>{index.elasticStorageGB.toFixed(2)} GB</span>
                                                    {displayRates && (
                                                        <TooltipIcon
                                                            content={`${t.hotTier}: ${index.elasticStoragePerHotTierDay.toFixed(2)}GB/${t.day}, ${t.coldTier}: ${index.elasticStoragePerColdTierDay.toFixed(2)}GB/${t.day}`}
                                                            alignment={direction === 'rtl' ? 'right' : 'left'}
                                                        />
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-800">
                                                <span className="text-left">{t.s3Storage}</span>
                                                <span className="text-right">
                                                    <span dir='ltr'>{index.S3StorageGB.toFixed(2)} GB</span>
                                                    {displayRates && (
                                                        <TooltipIcon
                                                            content={`${t.coldTier}: ${index.S3StoragePerColdTierDay.toFixed(2)}GB/${t.day}`}
                                                            alignment={direction === 'rtl' ? 'right' : 'left'}
                                                        />
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {displayMethod === 'combined' && (
                                    <>
                                        <div className="flex justify-between text-sm font-bold text-gray-800 mt-4">
                                            <span>{t.totalRetentionPeriod}</span>
                                            <span>{index.totalRetentionDays} {t.day}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-800 mt-4">
                                            <span>{t.storage}</span>
                                            <span dir={direction}>{(index.elasticStorageGB + index.S3StorageGB).toFixed(2)} GB</span>
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
