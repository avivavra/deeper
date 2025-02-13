import React from 'react';
import { Trash2, Share2, Upload } from 'lucide-react';
import { ChangeLogEntry, IndexData } from './models';
import GenericDropdown from '../../components/GenericDropdown';

interface ChangeLogProps {
  changeLog: { [key: string]: ChangeLogEntry };
  direction: 'ltr' | 'rtl';
  displayMode: 'combined' | 'separate';
  indices: IndexData[];
  selectedCluster: { indices: IndexData[] };
  handleRevertChange: (indexName: string) => void;
  handleExport: () => void;
  handleEmail: () => void;
  handleResetChanges: () => void;
  handleImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  t: {
    changeLog: string;
    exportToFile: string;
    exportToEmail: string;
    days: string;
    impact: string;
    storage: string;
    hotTier: string;
    coldTier: string;
    noChanges: string;
  };
  translateIndexName: boolean;
}

const ChangeLog: React.FC<ChangeLogProps> = ({
  changeLog,
  direction,
  displayMode,
  indices,
  handleRevertChange,
  handleExport,
  handleEmail,
  handleResetChanges,
  handleImport,
  t,
  translateIndexName,
}) => {
  const arrow = direction === 'ltr' ? '→' : '←';

  return (
    <div className="bg-white shadow-lg w-72 p-6 sticky top-0 h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{t.changeLog}</h2>
        <div className="flex gap-2">
          {Object.keys(changeLog).length > 0 ? (
            <>
              <GenericDropdown
                buttonLabel={<Share2 className="h-4 w-4 mx-2 text-gray-800" />}
                options={[
                  { label: t.exportToFile, value: 'exportToFile' },
                  { label: t.exportToEmail, value: 'exportToEmail' }
                ]}
                onSelect={(value) => {
                  if (value === 'exportToFile') handleExport();
                  if (value === 'exportToEmail') handleEmail();
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
            <div className="relative">
              <input
                type="file"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".txt"
              />
              <button
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="h-4 w-4 mx-2 text-gray-800" />
              </button>
            </div>
          )}
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
                  <div className="font-medium text-gray-800">{translateIndexName ? hebrewIndexName : indexName}</div>
                  <button
                    onClick={() => handleRevertChange(indexName)}
                    className="px-2 py-1 text-sm text-gray-500 hover:text-red-500 focus:outline-none"
                  >
                    <Trash2 className="h-4 w-4 mx-2 text-gray-800" />
                  </button>
                </div>
                {displayMode === 'combined' ? (
                  <>
                    <div className="text-gray-600 mt-1">
                      {t.days}: {change.original.hotDays + change.original.coldDays} {arrow} {change.current.hotDays + change.current.coldDays}
                    </div>
                    <div className="font-medium text-gray-800 mt-2">{t.impact}</div>
                    <div className="text-sm ml-2 text-gray-800">
                      {t.storage}: {totalStorageChange > 0 ? '+' : ''}{totalStorageChange} GB
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
                      {t.hotTier}: {change.current.elasticStorage - change.original.elasticStorage > 0 ? '+' : ''}{change.current.elasticStorage - change.original.elasticStorage} GB
                    </div>
                    <div className="text-sm ml-2 text-gray-800">
                      {t.coldTier}: {change.current.s3Storage - change.original.s3Storage > 0 ? '+' : ''}{change.current.s3Storage - change.original.s3Storage} GB
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
    </div>
  );
};

export default ChangeLog;
