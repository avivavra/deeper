import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { TooltipIcon, CustomSlider, GenericModal } from '../../../components';
import { SourceGroup, Direction, Translation, Source } from '../models';
import { AddSourceForm } from './forms/AddSourceForm';
import { format } from '../../../utils';

type RetentionManagementProps = {
    isInSimulation: boolean;
    filteredSourceGroups: SourceGroup[];
    direction: Direction;
    t: Translation;
    displayTechData: boolean;
    translateNames: boolean;
    handleSourceGroupRetentionChange: (name: string, newHotDays: number, newColdDays: number, newElasticStorage: number, newS3Storage: number) => void;
    handleRemoveSourceGroup: (name: string) => void;
    setShowAddSourceGroup: (show: boolean) => void;
    sources: Source[];
    handleAddSource: (newSource: Source) => void;
    handleRemoveSource: (sourceName: string) => void;
    actionButtons?: React.ReactNode;
    sourcesTranslation: {
        origin: string;
        translated: string;
    }[];
};

export const RetentionManagement = ({
    isInSimulation,
    filteredSourceGroups,
    direction,
    translateNames,
    t,
    displayTechData,
    handleSourceGroupRetentionChange,
    handleRemoveSourceGroup,
    setShowAddSourceGroup,
    sources,
    handleAddSource: handleAddSourceExternal,
    handleRemoveSource,
    actionButtons,
    sourcesTranslation
}: RetentionManagementProps) => {
    const [showAddSource, setShowAddSource] = useState(false);
    const [relatedSourceGroup, setRelatedSourceGroup] = useState<SourceGroup | null>(null);
    const [editingHotRetention, setEditingHotRetention] = useState<string | null>(null);
    const [editingColdRetention, setEditingColdRetention] = useState<string | null>(null);
    const [hotRetentionValue, setHotRetentionValue] = useState<number | null>(null);
    const [coldRetentionValue, setColdRetentionValue] = useState<number | null>(null);

    const handleRetentionChange = (sourceGroupName: string, newHotDays: number, newColdDays: number) => {
        const sourceGroup = filteredSourceGroups.find(i => i.name === sourceGroupName);
        if (!sourceGroup) return;

        const hotDaysDiff = newHotDays - sourceGroup.hotRetentionDays;
        const coldDaysDiff = newColdDays - sourceGroup.coldRetentionDays;

        const newElasticStorage = sourceGroup.elasticStorage + (sourceGroup.elasticStoragePerHotTierDay * hotDaysDiff) + (sourceGroup.elasticStoragePerColdTierDay * coldDaysDiff);
        const newS3Storage = sourceGroup.S3Storage + (sourceGroup.S3StoragePerColdTierDay * coldDaysDiff);

        handleSourceGroupRetentionChange(sourceGroupName, newHotDays, newColdDays, newElasticStorage, newS3Storage);
    };

    const handleHotRetentionDoubleClick = (sourceGroupName: string, currentHotDays: number) => {
        if (currentHotDays !== Infinity && !isAnyRetentionInfinity(sourceGroupName)) {
            setEditingHotRetention(sourceGroupName);
            setHotRetentionValue(currentHotDays);
        }
    };

    const handleColdRetentionDoubleClick = (sourceGroupName: string, currentColdDays: number) => {
        if (currentColdDays !== Infinity && !isAnyRetentionInfinity(sourceGroupName)) {
            setEditingColdRetention(sourceGroupName);
            setColdRetentionValue(currentColdDays);
        }
    };

    const handleHotRetentionBlur = (sourceGroupName: string) => {
        if (hotRetentionValue !== null) {
            const newHotDays = hotRetentionValue < 1 ? 1 : hotRetentionValue;
            setEditingHotRetention(null);
            const sourceGroup = filteredSourceGroups.find(i => i.name === sourceGroupName);
            if (sourceGroup) {
                handleRetentionChange(sourceGroupName, newHotDays, sourceGroup.coldRetentionDays);
            }
        }
    };

    const handleColdRetentionBlur = (sourceGroupName: string) => {
        if (coldRetentionValue !== null) {
            setEditingColdRetention(null);
            const sourceGroup = filteredSourceGroups.find(i => i.name === sourceGroupName);
            if (sourceGroup) {
                handleRetentionChange(sourceGroupName, sourceGroup.hotRetentionDays, coldRetentionValue);
            }
        }
    };

    const handleHotRetentionKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, sourceGroupName: string) => {
        if (e.key === 'Enter') {
            handleHotRetentionBlur(sourceGroupName);
        }
    };

    const handleColdRetentionKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, sourceGroupName: string) => {
        if (e.key === 'Enter') {
            handleColdRetentionBlur(sourceGroupName);
        }
    };

    const handleAddSource = (sourceGroup: SourceGroup) => {
        setRelatedSourceGroup(sourceGroup);
        setShowAddSource(true);
    };

    const handleAddSourceSubmit = (newSource: Source) => {
        handleAddSourceExternal(newSource);
        setShowAddSource(false);
    };

    const isAnyRetentionInfinity = (sourceGroupName: string) => {
        const sourceGroup = filteredSourceGroups.find(i => i.name === sourceGroupName);
        return sourceGroup ? sourceGroup.hotRetentionDays === Infinity || sourceGroup.coldRetentionDays === Infinity : false;
    };

    const marginClassName = direction === 'ltr' ? 'ml-' : 'mr-';

    const calculateTotalStorage = (sourceGroup: SourceGroup) => {
        const relatedSources = sources.filter(source => source.relatedSourceGroup === sourceGroup.name);
        const totalElasticStorage = relatedSources.reduce((acc, source) => acc + source.elasticStorage, sourceGroup.elasticStorage);
        const totalS3Storage = relatedSources.reduce((acc, source) => acc + source.S3Storage, sourceGroup.S3Storage);
        const totalElasticStoragePerHotTierDay = relatedSources.reduce((acc, source) => acc + source.elasticStoragePerHotTierDay, sourceGroup.elasticStoragePerHotTierDay);
        const totalElasticStoragePerColdTierDay = relatedSources.reduce((acc, source) => acc + source.elasticStoragePerColdTierDay, sourceGroup.elasticStoragePerColdTierDay);
        const totalS3StoragePerColdTierDay = relatedSources.reduce((acc, source) => acc + source.S3StoragePerColdTierDay, sourceGroup.S3StoragePerColdTierDay);
        return { totalElasticStorage, totalS3Storage, totalElasticStoragePerHotTierDay, totalElasticStoragePerColdTierDay, totalS3StoragePerColdTierDay };
    };

    return (
        <div>
            <GenericModal showModal={showAddSource} setShowModal={setShowAddSource}>
                {relatedSourceGroup && (
                    <AddSourceForm
                        t={t}
                        setShowAddSource={setShowAddSource}
                        handleAddSource={handleAddSourceSubmit}
                        sourceGroups={filteredSourceGroups}
                        relatedSourceGroup={relatedSourceGroup}
                        translateNames={translateNames}
                    />
                )}
            </GenericModal>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">{t.retentionManagement}</h2>
                    <div className="flex items-center">
                        {isInSimulation && (
                            <button
                                onClick={() => setShowAddSourceGroup(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Plus className="h-4 w-4 mx-2 text-white" />
                                {t.addSourceGroup}
                                <TooltipIcon
                                    content={t.addSourceGroupExplanation}
                                    alignment={direction === 'rtl' ? 'right' : 'left'}
                                >
                                    <span className={`${marginClassName}2 text-gray-200 cursor-pointer`}>?</span>
                                </TooltipIcon>
                            </button>
                        )}
                        <div className={`flex ${direction === 'rtl' ? 'mr-4' : 'ml-4'}`}>
                            {actionButtons} {/* Render action buttons here */}
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredSourceGroups.map(sourceGroup => {
                            const { totalElasticStorage, totalS3Storage, totalElasticStoragePerHotTierDay, totalElasticStoragePerColdTierDay, totalS3StoragePerColdTierDay } = calculateTotalStorage(sourceGroup);
                            const disableEditing = isAnyRetentionInfinity(sourceGroup.name);
                            const canAddSources = sourceGroup.canAddSources !== false;
                            const showToUsers = displayTechData || sourceGroup.showToUsers !== false;

                            if (!showToUsers) return null;

                            return (
                                <div key={sourceGroup.name} className="bg-gray-50 p-4 rounded-lg border relative">
                                    <div className="flex justify-between items-center">
                                        <div className="flex w-full items-center">
                                            <h3 className="text-lg font-bold text-gray-800 whitespace-nowrap">
                                                {direction === 'ltr' ? sourceGroup.name : sourceGroup.hebrewName}
                                            </h3>
                                            {displayTechData && (
                                                <TooltipIcon
                                                    content={
                                                        <>
                                                            <div>
                                                                <strong>Hot Tier</strong>
                                                                <br />
                                                                {
                                                                    sourceGroup.indexNamesByTier.hotTier.length === 0
                                                                        ? <div>No Indices</div>
                                                                        : <span>{[...sourceGroup.indexNamesByTier.hotTier.slice(0, 3).join(', ')]}</span>
                                                                }
                                                                {sourceGroup.indexNamesByTier.hotTier.length > 3 && (
                                                                    <span>...</span>
                                                                )}
                                                            </div>
                                                            <div className="mt-2">
                                                                <strong>Cold Tier</strong>
                                                                <br />
                                                                {
                                                                    sourceGroup.indexNamesByTier.coldTier.length === 0
                                                                        ? <div>No Indices</div>
                                                                        : <span>{sourceGroup.indexNamesByTier.coldTier.slice(0, 3).join(', ')}</span>
                                                                }
                                                                {sourceGroup.indexNamesByTier.coldTier.length > 3 && (
                                                                    <span>...</span>
                                                                )}
                                                            </div>
                                                        </>
                                                    }
                                                    alignment={direction === 'rtl' ? 'right' : 'left'}
                                                />
                                            )}
                                            <div className="flex overflow-x-auto">
                                                {sources.filter(source => source.relatedSourceGroup === sourceGroup.name).map(source => (
                                                    <TooltipIcon
                                                        key={source.name}
                                                        alignment={direction === 'rtl' ? 'right' : 'left'}
                                                        content={
                                                            <>
                                                                <div>{t.elasticsearchStorage}: {format.numberToFixed(source.elasticStorage)} GB</div>
                                                                <div>{t.s3Storage}: {format.numberToFixed(source.S3Storage)} GB</div>
                                                            </>
                                                        }
                                                    >
                                                        <span className={`${marginClassName}2 bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-2 rounded-md border border-gray-300 cursor-pointer flex items-center overflow-hidden whitespace-nowrap`}>
                                                            {source.name}
                                                            {isInSimulation && (
                                                                <button
                                                                    onClick={() => handleRemoveSource(source.name)}
                                                                    className={`${marginClassName}2 text-gray-500 hover:text-gray-800`}
                                                                >
                                                                    &times;
                                                                </button>
                                                            )}
                                                        </span>
                                                    </TooltipIcon>
                                                ))}
                                                {
                                                    sourceGroup.sourceNames.map(sourceName => {
                                                        const displayName = translateNames ? sourcesTranslation.find(source => source.origin === sourceName)?.translated || sourceName : sourceName;

                                                        return (
                                                            <div key={sourceName} className="relative inline-block"> {/* Add unique key here */}
                                                                <span className={`${marginClassName}2 bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-2 rounded-md border border-gray-300 cursor-pointer flex items-center overflow-hidden whitespace-nowrap`}>
                                                                    {displayName}
                                                                </span>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                            {isInSimulation && canAddSources && !disableEditing && (
                                                <button
                                                    onClick={() => handleAddSource(sourceGroup)}
                                                    className={`${marginClassName}2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap`}
                                                >
                                                    <Plus className="h-4 w-4 mx-1 text-white" />
                                                    {t.addSource}
                                                    <TooltipIcon
                                                        content={t.addSourceExplanation}
                                                        alignment={direction === 'rtl' ? 'right' : 'left'}
                                                    >
                                                        <span className={`${marginClassName}2 text-gray-200 cursor-pointer`}>?</span>
                                                    </TooltipIcon>
                                                </button>
                                            )}
                                            {isInSimulation && (
                                                <div className={`flex ${direction === 'ltr' ? 'ml-2' : 'mr-2'} items-center`}>
                                                    <button
                                                        onClick={() => handleRemoveSourceGroup(sourceGroup.name)}
                                                        className={`inline-flex items-center p-2 border border-gray-300 text-sm font-medium rounded-md ${disableEditing ? 'text-gray-400 bg-gray-200 cursor-not-allowed' : 'text-gray-800 bg-white hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'}`}
                                                        disabled={disableEditing}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isInSimulation ? (
                                        <>
                                            <div className="space-y-2 mt-4">
                                                <div className="flex justify-between text-sm text-gray-800">
                                                    <span>{t.hotTierRetention}</span>
                                                    {editingHotRetention === sourceGroup.name ? (
                                                        <input
                                                            type="number"
                                                            value={hotRetentionValue !== null ? hotRetentionValue : sourceGroup.hotRetentionDays}
                                                            onChange={(e) => setHotRetentionValue(parseInt(e.target.value))}
                                                            onBlur={() => handleHotRetentionBlur(sourceGroup.name)}
                                                            onKeyPress={(e) => handleHotRetentionKeyPress(e, sourceGroup.name)}
                                                            className="border rounded p-1 w-16"
                                                            disabled={disableEditing}
                                                        />
                                                    ) : (
                                                        <span onDoubleClick={() => handleHotRetentionDoubleClick(sourceGroup.name, sourceGroup.hotRetentionDays)}>
                                                            {sourceGroup.hotRetentionDays === Infinity ? t.forever : format.numberToFixed(sourceGroup.hotRetentionDays)}
                                                        </span>
                                                    )}
                                                </div>
                                                <CustomSlider
                                                    resetKey={`hot-${sourceGroup.name}-${sourceGroup.hotRetentionDays}`}
                                                    value={[sourceGroup.hotRetentionDays]}
                                                    min={1}
                                                    max={sourceGroup.initialHotRetentionDays >= 10 ? sourceGroup.initialHotRetentionDays * 2 : 20}
                                                    onChange={(value) => handleRetentionChange(sourceGroup.name, value[0], sourceGroup.coldRetentionDays)}
                                                    disabled={disableEditing}
                                                />
                                            </div>

                                            <div className="space-y-2 mt-4">
                                                <div className="flex justify-between text-sm text-gray-800">
                                                    <span>{t.coldTierRetention}</span>
                                                    {editingColdRetention === sourceGroup.name ? (
                                                        <input
                                                            type="number"
                                                            value={coldRetentionValue !== null ? coldRetentionValue : sourceGroup.coldRetentionDays}
                                                            onChange={(e) => setColdRetentionValue(parseInt(e.target.value))}
                                                            onBlur={() => handleColdRetentionBlur(sourceGroup.name)}
                                                            onKeyPress={(e) => handleColdRetentionKeyPress(e, sourceGroup.name)}
                                                            className="border rounded p-1 w-16"
                                                            disabled={disableEditing}
                                                        />
                                                    ) : (
                                                        <span onDoubleClick={() => handleColdRetentionDoubleClick(sourceGroup.name, sourceGroup.coldRetentionDays)}>
                                                            {sourceGroup.coldRetentionDays === Infinity ? t.forever : format.numberToFixed(sourceGroup.coldRetentionDays)}
                                                        </span>
                                                    )}
                                                </div>
                                                <CustomSlider
                                                    resetKey={`cold-${sourceGroup.name}-${sourceGroup.coldRetentionDays}`}
                                                    value={[sourceGroup.coldRetentionDays]}
                                                    min={0}
                                                    max={sourceGroup.initialColdRetentionDays >= 20 ? sourceGroup.initialColdRetentionDays * 2 : 40}
                                                    onChange={(value) => handleRetentionChange(sourceGroup.name, sourceGroup.hotRetentionDays, value[0])}
                                                    disabled={disableEditing}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4 mt-2 mb-4">
                                            <div className="flex justify-between text-sm text-gray-800">
                                                <span className="text-left">{t.hotTierRetention}</span>
                                                <span className="text-right">{sourceGroup.hotRetentionDays === Infinity ? t.forever : `${format.numberToFixed(sourceGroup.hotRetentionDays)} ${t.day}`}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-800">
                                                <span className="text-left">{t.coldTierRetention}</span>
                                                <span className="text-right">{sourceGroup.coldRetentionDays === Infinity ? t.forever : `${format.numberToFixed(sourceGroup.coldRetentionDays)} ${t.day}`}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4 mt-2">
                                        <div className="flex justify-between text-sm font-bold text-gray-800">
                                            <span>{t.totalRetentionPeriod}</span>
                                            <span>{sourceGroup.totalRetentionDays === Infinity ? t.forever : `${format.numberToFixed(sourceGroup.totalRetentionDays)} ${t.day}`}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-800">
                                            <span className="text-left">{t.elasticsearchStorage}</span>
                                            <span className="text-right">
                                                <span dir='ltr'>{format.numberToFixed(totalElasticStorage)} GB</span>
                                                {displayTechData && (
                                                    <TooltipIcon
                                                        content={`${t.hotTier}: ${format.numberToFixed(totalElasticStoragePerHotTierDay)}GB/${t.day}, ${t.coldTier}: ${format.numberToFixed(totalElasticStoragePerColdTierDay)}GB/${t.day}`}
                                                        alignment={direction === 'rtl' ? 'right' : 'left'}
                                                    />
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-800">
                                            <span className="text-left">{t.s3Storage}</span>
                                            <span className="text-right">
                                                <span dir='ltr'>{format.numberToFixed(totalS3Storage)} GB</span>
                                                {displayTechData && (
                                                    <TooltipIcon
                                                        content={`${t.coldTier}: ${format.numberToFixed(totalS3StoragePerColdTierDay)}GB/${t.day}`}
                                                        alignment={direction === 'rtl' ? 'right' : 'left'}
                                                    />
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
