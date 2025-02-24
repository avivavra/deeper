import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { TooltipIcon, CustomSlider, GenericModal } from '../../../components';
import { IndexData, Direction, DisplayMethod, Translation, SourceData } from '../models';
import { AddSourceForm } from './forms/AddSourceForm';

type IndexRetentionManagementProps = {
    isEditMode: boolean;
    filteredIndices: IndexData[];
    direction: Direction;
    displayMethod: DisplayMethod;
    t: Translation;
    displayRates: boolean;
    translateIndexNames: boolean;
    handleTotalRetentionChange: (indexName: string, newTotalDays: number) => void;
    handleIndexRetentionChange: (indexName: string, newHotDays: number, newColdDays: number, newElasticStorage: number, newS3Storage: number) => void;
    handleRemoveIndex: (indexName: string) => void;
    setShowAddIndex: (show: boolean) => void;
    showAddIndex: boolean;
    sources: SourceData[];
    setSources: React.Dispatch<React.SetStateAction<SourceData[]>>;
};

export const IndexRetentionManagement = ({
    isEditMode,
    filteredIndices,
    direction,
    displayMethod,
    translateIndexNames,
    t,
    displayRates,
    handleTotalRetentionChange,
    handleIndexRetentionChange,
    handleRemoveIndex,
    setShowAddIndex,
    sources,
    setSources
}: IndexRetentionManagementProps) => {
    const [showAddSource, setShowAddSource] = useState(false);
    const [relatedIndex, setRelatedIndex] = useState<IndexData | null>(null);

    const handleRetentionChange = (indexName: string, newHotDays: number, newColdDays: number) => {
        const index = filteredIndices.find(i => i.name === indexName);
        if (!index) return;

        const hotDaysDiff = newHotDays - index.hotRetentionDays;
        const coldDaysDiff = newColdDays - index.coldRetentionDays;

        const newElasticStorage = index.elasticStorage + (index.elasticStoragePerHotTierDay * hotDaysDiff) + (index.elasticStoragePerColdTierDay * coldDaysDiff);
        const newS3Storage = index.S3Storage + (index.S3StoragePerColdTierDay * coldDaysDiff);

        handleIndexRetentionChange(indexName, newHotDays, newColdDays, newElasticStorage, newS3Storage);
    };

    const handleAddSource = (index: IndexData) => {
        setRelatedIndex(index);
        setShowAddSource(true);
    };

    const handleAddSourceSubmit = (newSourceData: SourceData) => {
        setSources(prevSources => [...prevSources, newSourceData]);
        setShowAddSource(false);
    };

    return (
        <div>
            <GenericModal showModal={showAddSource} setShowModal={setShowAddSource}>
                {relatedIndex && (
                    <AddSourceForm
                        t={t}
                        setShowAddSource={setShowAddSource}
                        handleAddSource={handleAddSourceSubmit}
                        indices={filteredIndices}
                        relatedIndex={relatedIndex}
                        translateIndexNames={translateIndexNames}
                    />
                )}
            </GenericModal>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">{t.indexRetentionManagement}</h2>
                    {isEditMode && (
                        <button
                            onClick={() => setShowAddIndex(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Plus className="h-4 w-4 mx-2 text-white" />
                            {t.addIndex}
                        </button>
                    )}
                </div>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredIndices.map(index => (
                            <div key={index.name} className="bg-gray-50 p-4 rounded-lg border relative">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                        {direction === 'ltr' ? index.name : index.hebrewName}
                                        {displayRates && (
                                            <TooltipIcon
                                                content={
                                                    <>
                                                        <div>
                                                            <strong>Hot Tier</strong>
                                                            <br />
                                                            {
                                                                index.indexNamesByTier.hotTier.length === 0
                                                                    ? <div>No Indices</div>
                                                                    : <span>{[...index.indexNamesByTier.hotTier.slice(0, 3).join(', ')]}</span>
                                                            }
                                                            {index.indexNamesByTier.hotTier.length > 3 && (
                                                                <span>...</span>
                                                            )}
                                                        </div>
                                                        <div className="mt-2">
                                                            <strong>Cold Tier</strong>
                                                            <br />
                                                            {
                                                                index.indexNamesByTier.coldTier.length === 0
                                                                    ? <div>No Indices</div>
                                                                    : <span>{index.indexNamesByTier.coldTier.slice(0, 3).join(', ')}</span>
                                                            }
                                                            {index.indexNamesByTier.coldTier.length > 3 && (
                                                                <span>...</span>
                                                            )}
                                                        </div>
                                                    </>
                                                }
                                                alignment={direction === 'rtl' ? 'right' : 'left'}
                                            />
                                        )}
                                        {sources.filter(source => source.relatedIndex === index.name).map(source => (
                                            <TooltipIcon
                                                key={source.name}
                                                alignment={direction === 'rtl' ? 'right' : 'left'}
                                                content={
                                                    <>
                                                        <div>{t.elasticsearchStorage}: {source.elasticStorage.toFixed(2)} GB</div>
                                                        <div>{t.s3Storage}: {source.S3Storage.toFixed(2)} GB</div>
                                                    </>
                                                }
                                            >
                                                <span className="ml-2 bg-gray-200 text-gray-800 text-sm font-semibold mr-2 px-3 py-2 rounded-md border border-gray-300 cursor-pointer">
                                                    {source.name}
                                                </span>
                                            </TooltipIcon>
                                        ))}
                                        {isEditMode && (
                                            <button
                                                onClick={() => handleAddSource(index)}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ml-2 mr-2"
                                            >
                                                <Plus className="h-4 w-4 mx-1 text-white" />
                                                {t.addSource}
                                            </button>
                                        )}
                                    </h3>
                                    {isEditMode && (
                                        <div className={`flex ${direction === 'ltr' ? 'space-x-2' : 'space-x-reverse'} items-center`}>
                                            <button
                                                onClick={() => handleRemoveIndex(index.name)}
                                                className="inline-flex items-center p-2 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
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
                                                    max={index.initialHotRetentionDays >= 10 ? index.initialHotRetentionDays * 2 : 20}
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
                                                    max={index.initialColdRetentionDays >= 20 ? index.initialColdRetentionDays * 2 : 40}
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
                                                    <span dir='ltr'>{index.elasticStorage.toFixed(2)} GB</span>
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
                                                    <span dir='ltr'>{index.S3Storage.toFixed(2)} GB</span>
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
                                            <span dir={direction}>{(index.elasticStorage + index.S3Storage).toFixed(2)} GB</span>
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
