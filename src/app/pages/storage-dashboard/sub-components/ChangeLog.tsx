import React, { useState } from 'react';
import { Trash2, Share2, Upload } from 'lucide-react';
import { IndexData } from '../models/cluster-models';
import { ChangeLogEntry, Direction, DisplayMethod, Translation } from '../models/display-models';
import GenericDropdown from '../../../components/GenericDropdown';
import GenericModal from '../../../components/GenericModal';

interface ChangeLogProps {
  changeLog: { [key: string]: ChangeLogEntry };
  direction: Direction;
  displayMethod: DisplayMethod;
  indices: IndexData[];
  selectedCluster: { indices: IndexData[] };
  handleRevertChange: (indexName: string) => void;
  handleResetChanges: () => void;
  setIndices: React.Dispatch<React.SetStateAction<IndexData[]>>;
  handleIndexRetentionChange: (indexName: string, newHotDays: number, newColdDays: number) => void;
  setSelectedIndices: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  setChangeLog: React.Dispatch<React.SetStateAction<{ [key: string]: ChangeLogEntry }>>;
  t: Translation;
  translateIndexNames: boolean;
}

const formatChangeLog = (changeLog: { [key: string]: ChangeLogEntry }) => {
  return Object.entries(changeLog).map(([indexName, change]) => {
    const hotDaysChange = change.current.hotDays - change.original.hotDays;
    const coldDaysChange = change.current.coldDays - change.original.coldDays;
    const totalElasticStorageChange = change.current.elasticStorage - change.original.elasticStorage;
    const totalS3StorageChange = change.current.s3Storage - change.original.s3Storage;

    return `Index: ${indexName}
Hot Retention Days: ${change.original.hotDays} → ${change.current.hotDays} days (${hotDaysChange > 0 ? '+' : ''}${hotDaysChange} days)
Cold Retention Days: ${change.original.coldDays} → ${change.current.coldDays} days (${coldDaysChange > 0 ? '+' : ''}${coldDaysChange} days)
Elasticsearch Storage: ${change.original.elasticStorage.toFixed(2)} GB → ${change.current.elasticStorage.toFixed(2)} GB (${totalElasticStorageChange > 0 ? '+' : ''}${totalElasticStorageChange.toFixed(2)} GB)
S3 Storage: ${change.original.s3Storage.toFixed(2)} GB → ${change.current.s3Storage.toFixed(2)} GB (${totalS3StorageChange > 0 ? '+' : ''}${totalS3StorageChange.toFixed(2)} GB)
`;
  }).join('\n');
};

const parseChangeLog = (text: string) => {
  const parsedEntries: { indexName: string, newHotDays: number, newColdDays: number, newElasticStorage: number, newS3Storage: number }[] = [];
  const entries = text.split('\n\n');
  entries.forEach(entry => {
    const lines = entry.trim().split('\n');
    if (lines.length >= 5) {
      const indexName = lines[0].replace('Index: ', '');
      const hotDaysMatch = lines[1].match(/Hot Retention Days: \d+ → (\d+) days/);
      const coldDaysMatch = lines[2].match(/Cold Retention Days: \d+ → (\d+) days/);
      const elasticStorageMatch = lines[3].match(/Elasticsearch Storage: \d+ GB → (\d+(\.\d+)?) GB/);
      const s3StorageMatch = lines[4].match(/S3 Storage: \d+ GB → (\d+(\.\d+)?) GB/);

      if (hotDaysMatch && coldDaysMatch && elasticStorageMatch && s3StorageMatch) {
        parsedEntries.push({
          indexName,
          newHotDays: parseInt(hotDaysMatch[1]),
          newColdDays: parseInt(coldDaysMatch[1]),
          newElasticStorage: parseFloat(elasticStorageMatch[1]),
          newS3Storage: parseFloat(s3StorageMatch[1]),
        });
      }
    }
  });
  return parsedEntries;
};

const ChangeLog: React.FC<ChangeLogProps> = ({
  changeLog,
  direction,
  displayMethod,
  indices,
  selectedCluster,
  handleRevertChange,
  handleResetChanges,
  setIndices,
  handleIndexRetentionChange,
  setSelectedIndices,
  setChangeLog,
  t,
  translateIndexNames,
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

    const subject = 'Elasticsearch Index Changes';
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

  const processImportedEntries = (parsedEntries: { indexName: string, newHotDays: number, newColdDays: number, newElasticStorage: number, newS3Storage: number }[]) => {
    parsedEntries.forEach(({ indexName, newHotDays, newColdDays, newElasticStorage, newS3Storage }) => {
      const isRemovedIndex = newHotDays === 0 && newColdDays === 0;
      if (isRemovedIndex) {
        setIndices(prevIndices => prevIndices.filter(index => index.name !== indexName));
        setSelectedIndices(prev => {
          const { [indexName]: _, ...rest } = prev;
          return rest;
        });
        setChangeLog(prev => {
          const originalIndex = selectedCluster.indices.find(i => i.name === indexName);
          return {
            ...prev,
            [indexName]: {
              original: {
                hotDays: originalIndex ? originalIndex.hotRetentionDays : 0,
                coldDays: originalIndex ? originalIndex.coldRetentionDays : 0,
                elasticStorage: originalIndex ? originalIndex.elasticStorage : 0,
                s3Storage: originalIndex ? originalIndex.S3Storage : 0,
              },
              current: {
                hotDays: 0,
                coldDays: 0,
                elasticStorage: 0,
                s3Storage: 0,
              }
            }
          };
        });
      } else {
        const isExistingIndex = indices.find(index => index.name === indexName);
        if (isExistingIndex) {
          handleIndexRetentionChange(indexName, newHotDays, newColdDays);
        } else {
          const elasticStoragePerHotTierDay = newHotDays > 0 ? newElasticStorage / newHotDays : 0;
          const S3StoragePerColdTierDay = newColdDays > 0 ? newS3Storage / newColdDays : 0;

          const newIndexData = {
            name: indexName,
            hebrewName: indexName,
            hotRetentionDays: newHotDays,
            coldRetentionDays: newColdDays,
            elasticStorage: newElasticStorage,
            S3Storage: newS3Storage,
            totalRetentionDays: newHotDays + newColdDays,
            initialHotRetentionDays: newHotDays,
            initialColdRetentionDays: newColdDays,
            elasticStoragePerHotTierDay: elasticStoragePerHotTierDay,
            S3StoragePerColdTierDay: S3StoragePerColdTierDay,
            elasticStoragePerColdTierDay: 0
          };
          setIndices(prevIndices => [newIndexData, ...prevIndices]);
          setSelectedIndices(prev => ({ ...prev, [indexName]: true }));
          setChangeLog(prev => {
            return {
              ...prev,
              [indexName]: {
                original: {
                  hotDays: 0,
                  coldDays: 0,
                  elasticStorage: 0,
                  s3Storage: 0,
                },
                current: {
                  hotDays: newHotDays,
                  coldDays: newColdDays,
                  elasticStorage: newElasticStorage,
                  s3Storage: newS3Storage,
                }
              }
            };
          });
        }
      }
    });
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
          {Object.keys(changeLog).length > 0 ? (
            <>
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
              <button
                onClick={handleResetChanges}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Trash2 className="h-4 w-4 mx-2 text-gray-800" />
              </button>
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
        {Object.keys(changeLog).length > 0 ? (
          Object.entries(changeLog).map(([indexName, change]) => {
            const totalStorageChange = (change.current.elasticStorage + change.current.s3Storage) - (change.original.elasticStorage + change.original.s3Storage);
            const hebrewIndexName = indices.find(index => index.name === indexName)?.hebrewName || indexName;

            return (
              <div key={indexName} className={`text-sm ${direction === 'ltr' ? 'border-l-2 pl-3' : 'border-r-2 pr-3'} border-blue-500`}>
                <div className="flex justify-between items-start">
                  <div className="font-medium text-gray-800">{translateIndexNames ? hebrewIndexName : indexName}</div>
                  <button
                    onClick={() => handleRevertChange(indexName)}
                    className="px-2 py-1 text-sm text-gray-500 hover:text-red-500 focus:outline-none"
                  >
                    <Trash2 className="h-4 w-4 mx-2 text-gray-800" />
                  </button>
                </div>
                {displayMethod === 'combined' ? (
                  <>
                    <div className="text-gray-600 mt-1">
                      {t.days}: {change.original.hotDays + change.original.coldDays} {arrow} {change.current.hotDays + change.current.coldDays}
                    </div>
                    <div className="font-medium text-gray-800 mt-2">{t.impact}</div>
                    <div className="text-sm ml-2 text-gray-800">
                      {t.storage}: {totalStorageChange > 0 ? '+' : ''}{totalStorageChange.toFixed(2)} GB
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            );
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
                  className="px-4 py-2 mr-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleImportFromText}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

export default ChangeLog;
