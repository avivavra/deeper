import React, { useState } from 'react';
import { Trash2, Share2, Upload, RotateCw } from 'lucide-react';
import { SourceGroup, ChangeLogEntry, Direction, Translation } from '../../models';
import { GenericDropdown, GenericModal } from '../../../../components';

interface ChangeLogProps {
  changeLog: ChangeLogEntry[];
  direction: Direction;
  sourceGroups: SourceGroup[];
  handleRevertSourceGroupChange: (name: string) => void;
  handleResetChanges: () => void;
  handleSourceGroupRetentionChange: (name: string, newHotDays: number, newColdDays: number, newElasticStorage: number, newS3Storage: number) => void;
  handleSourceChange: (sourceName: string, newElasticStorage: number, newS3Storage: number) => void;
  t: Translation;
  translateNames: boolean;
  handleRemoveSourceGroup: (name: string) => void;
  handleAddNewSourceGroup: (name: string, newHotDays: number, newColdDays: number, newElasticStorage: number, newS3Storage: number) => void;
}

const formatChangeLog = (changeLog: ChangeLogEntry[]) => {
  return changeLog.map(change => {
    if (change.type === 'source') {
      const totalElasticStorageChange = change.current.elasticStorage - change.original.elasticStorage;
      const totalS3StorageChange = change.current.s3Storage - change.original.s3Storage;

      return `Source: ${change.name}
Elasticsearch Storage: ${change.original.elasticStorage?.toFixed(2) || 0} GB → ${change.current.elasticStorage?.toFixed(2) || 0} GB (${totalElasticStorageChange > 0 ? '+' : ''}${totalElasticStorageChange?.toFixed(2) || 0} GB)
S3 Storage: ${change.original.s3Storage?.toFixed(2) || 0} GB → ${change.current.s3Storage?.toFixed(2) || 0} GB (${totalS3StorageChange > 0 ? '+' : ''}${totalS3StorageChange?.toFixed(2) || 0} GB)
`;
    } else {
      const hotDaysChange = change.current.hotDays - change.original.hotDays;
      const coldDaysChange = change.current.coldDays - change.original.coldDays;
      const totalElasticStorageChange = change.current.elasticStorage - change.original.elasticStorage;
      const totalS3StorageChange = change.current.s3Storage - change.original.s3Storage;

      return `Source Group: ${change.name}
Hot Retention Days: ${change.original.hotDays} → ${change.current.hotDays} days (${hotDaysChange > 0 ? '+' : ''}${hotDaysChange} days)
Cold Retention Days: ${change.original.coldDays} → ${change.current.coldDays} days (${coldDaysChange > 0 ? '+' : ''}${coldDaysChange} days)
Elasticsearch Storage: ${change.original.elasticStorage?.toFixed(2) || 0} GB → ${change.current.elasticStorage?.toFixed(2) || 0} GB (${totalElasticStorageChange > 0 ? '+' : ''}${totalElasticStorageChange?.toFixed(2) || 0} GB)
S3 Storage: ${change.original.s3Storage?.toFixed(2) || 0} GB → ${change.current.s3Storage?.toFixed(2) || 0} GB (${totalS3StorageChange > 0 ? '+' : ''}${totalS3StorageChange?.toFixed(2) || 0} GB)
`;
    }
  }).join('\n');
};

const parseChangeLog = (text: string) => {
  const parsedEntries: { sourceGroupName: string, newHotDays: number, newColdDays: number, newElasticStorage: number, newS3Storage: number }[] = [];
  const entries = text.split('\n\n');
  entries.forEach(entry => {
    const lines = entry.trim().split('\n');
    if (lines.length >= 5) {
      const sourceGroupName = lines[0].replace('Source Group: ', '');
      const hotDaysMatch = lines[1].match(/Hot Retention Days: \d+ → (\d+) days/);
      const coldDaysMatch = lines[2].match(/Cold Retention Days: \d+ → (\d+) days/);
      const elasticStorageMatch = lines[3].match(/Elasticsearch Storage: \d+(\.\d+)? GB → (\d+(\.\d+)?) GB/);
      const s3StorageMatch = lines[4].match(/S3 Storage: \d+(\.\d+)? GB → (\d+(\.\d+)?) GB/);

      if (hotDaysMatch && coldDaysMatch && elasticStorageMatch && s3StorageMatch) {
        parsedEntries.push({
          sourceGroupName: sourceGroupName,
          newHotDays: parseInt(hotDaysMatch[1]),
          newColdDays: parseInt(coldDaysMatch[1]),
          newElasticStorage: parseFloat(elasticStorageMatch[2]),
          newS3Storage: parseFloat(s3StorageMatch[2]),
        });
      }
    }
  });
  return parsedEntries;
};

export const ChangeLog: React.FC<ChangeLogProps> = ({
  changeLog,
  direction,
  sourceGroups,
  handleRevertSourceGroupChange,
  handleResetChanges,
  handleSourceGroupRetentionChange,
  handleSourceChange,
  t,
  translateNames,
  handleRemoveSourceGroup,
  handleAddNewSourceGroup,
}) => {
  const arrow = direction === 'ltr' ? '→' : '←';
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  const handleExportToFile = () => {
    const text = formatChangeLog(changeLog);

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'storage-changes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportToEmail = () => {
    const text = formatChangeLog(changeLog);

    const subject = 'Elasticsearch Changes';
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = mailtoLink;
  };

  const handleCopyToClipboard = () => {
    const text = formatChangeLog(changeLog);

    navigator.clipboard.writeText(text).then(() => {
      console.log('Change log copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const processImportedEntries = (parsedEntries: { sourceGroupName: string, newHotDays: number, newColdDays: number, newElasticStorage: number, newS3Storage: number }[]) => {
    try {
      parsedEntries.forEach(({ sourceGroupName, newHotDays, newColdDays, newElasticStorage, newS3Storage }) => {
        const isRemovedSourceGroup = newHotDays === 0 && newColdDays === 0;
        if (isRemovedSourceGroup) {
          handleRemoveSourceGroup(sourceGroupName);
        } else {
          const isExistingSourceGroup = sourceGroups.find(sourceGroup => sourceGroup.name === sourceGroupName);
          if (isExistingSourceGroup) {
            handleSourceGroupRetentionChange(sourceGroupName, newHotDays, newColdDays, newElasticStorage, newS3Storage);
          } else {
            handleAddNewSourceGroup(sourceGroupName, newHotDays, newColdDays, newElasticStorage, newS3Storage);
          }
        }
      });
    } catch (error) {
      console.error('Error processing imported entries:', error);
    }
  };

  const handleImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const text = e.target?.result as string;
          const parsedEntries = parseChangeLog(text);
          processImportedEntries(parsedEntries);
        } catch (error) {
          console.error('Error importing changes:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImportFromText = () => {
    try {
      const parsedEntries = parseChangeLog(importText);
      processImportedEntries(parsedEntries);
    } catch (error) {
      console.error('Error importing changes:', error);
    }
    setShowImportModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{t.changeLog}</h2>
        <div className="flex gap-2">
          {changeLog.length > 0 ? (
            <>
              <button
                onClick={handleResetChanges}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <RotateCw className="h-4 w-4 mx-2 text-white" />
              </button>
              <GenericDropdown
                buttonLabel={<Share2 className="h-4 w-4 mx-2 text-gray-800" />}
                options={[
                  { label: t.exportToFile, value: 'exportToFile' },
                  { label: t.exportToEmail, value: 'exportToEmail' },
                  { label: t.copyToClipboard, value: 'copyToClipboard' }
                ]}
                onSelect={(value) => {
                  if (value === 'exportToFile') handleExportToFile();
                  if (value === 'exportToEmail') handleExportToEmail();
                  if (value === 'copyToClipboard') handleCopyToClipboard();
                }}
                width="w-40"
                type="radio"
                showChevron={false}
                hideInputs={true}
              />
            </>
          ) : (
            <GenericDropdown
              buttonLabel={<Upload className="h-4 w-4 mx-2 text-gray-800" />}
              options={[
                { label: t.importFromFile, value: 'importFromFile' },
                { label: t.importFromText, value: 'importFromText' }
              ]}
              onSelect={(value) => {
                if (value === 'importFromFile') {
                  document.getElementById('import-file-input')?.click();
                }
                if (value === 'importFromText') {
                  setShowImportModal(true);
                }
              }}
              width="w-40"
              type="radio"
              showChevron={false}
              hideInputs={true}
            />
          )}
          <input
            id="import-file-input"
            type="file"
            onChange={handleImportFromFile}
            className="hidden"
            accept=".txt"
          />
        </div>
      </div>
      <div className="space-y-4">
        {changeLog.length > 0 ? (
          changeLog.map(change => {
            if (change.type === 'source') {
              const elasticStorageChange = change.current.elasticStorage - change.original.elasticStorage;
              const s3StorageChange = change.current.s3Storage - change.original.s3Storage;
              return (
                <div key={change.name} className={`text-sm ${direction === 'ltr' ? 'border-l-2 pl-3' : 'border-r-2 pr-3'} border-green-500`}>
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-800">{change.name}</div>
                    <button
                      onClick={() => handleSourceChange(change.name, change.original.elasticStorage, change.original.s3Storage)}
                      className="px-2 py-1 text-sm text-gray-500 hover:text-red-500 focus:outline-none"
                    >
                      <Trash2 className="h-4 w-4 mx-2 text-gray-800" />
                    </button>
                  </div>
                  <div className="font-medium text-gray-800 mt-2">{t.impact}</div>
                  <div className="text-sm ml-2 text-gray-800">
                    {t.elasticsearchStorage}: {elasticStorageChange > 0 ? '+' : ''}{elasticStorageChange?.toFixed(2) || 0} GB
                  </div>
                  <div className="text-sm ml-2 text-gray-800">
                    {t.s3Storage}: {s3StorageChange > 0 ? '+' : ''}{s3StorageChange?.toFixed(2) || 0} GB
                  </div>
                </div>
              );
            } else {
              const hebrewName = sourceGroups.find(sourceGroup => sourceGroup.name === change.name)?.hebrewName || change.name;

              return (
                <div key={change.name} className={`text-sm ${direction === 'ltr' ? 'border-l-2 pl-3' : 'border-r-2 pr-3'} border-teal-500`}>
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-800">{translateNames ? hebrewName : change.name}</div>
                    <button
                      onClick={() => handleRevertSourceGroupChange(change.name)}
                      className="px-2 py-1 text-sm text-gray-500 hover:text-red-500 focus:outline-none"
                    >
                      <Trash2 className="h-4 w-4 mx-2 text-gray-800" />
                    </button>
                  </div>
                  <div className="text-gray-600 mt-1">
                    {t.hotTier}: {change.original.hotDays} {arrow} {change.current.hotDays} {t.days}
                  </div>
                  <div className="text-gray-600">
                    {t.coldTier}: {change.original.coldDays} {arrow} {change.current.coldDays} {t.days}
                  </div>
                  <div className="font-medium text-gray-800 mt-2">{t.impact}</div>
                  <div className="text-sm ml-2 text-gray-800">
                    {t.hotTier}: {change.current.elasticStorage - change.original.elasticStorage > 0 ? '+' : ''}{(change.current.elasticStorage - change.original.elasticStorage).toFixed(2)} GB
                  </div>
                  <div className="text-sm ml-2 text-gray-800">
                    {t.coldTier}: {change.current.s3Storage - change.original.s3Storage > 0 ? '+' : ''}{(change.current.s3Storage - change.original.s3Storage).toFixed(2)} GB
                  </div>
                </div>
              );
            }
          })
        ) : (
          <div className="text-gray-500 text-center py-4">
            {t.noChanges}
          </div>
        )}
      </div>
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <GenericModal showModal={showImportModal} setShowModal={setShowImportModal}>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800">{t.importFromText}</h2>
              <textarea
                className="w-full h-40 p-2 mt-2 border border-gray-300 rounded-md text-gray-900"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 mr-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleImportFromText}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  {t.import}
                </button>
              </div>
            </div>
          </GenericModal>
        </div>
      )}
    </div>
  );
};
