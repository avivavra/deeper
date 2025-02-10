import React, { useRef, useState } from 'react';
import { Trash2, Share2, Upload } from 'lucide-react';
import { translations } from './translations';
import { ChangeLogEntry, IndexData } from './models';

interface ChangeLogProps {
  changeLog: { [key: string]: ChangeLogEntry };
  audience: 'developer' | 'user';
  indices: IndexData[];
  selectedCluster: { indices: IndexData[] };
  handleRevertChange: (indexName: string) => void;
  handleExport: () => void;
  handleEmail: () => void;
  handleResetChanges: () => void;
  handleImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ChangeLog: React.FC<ChangeLogProps> = ({
  changeLog,
  audience,
  indices,
  selectedCluster,
  handleRevertChange,
  handleExport,
  handleEmail,
  handleResetChanges,
  handleImport,
}) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef(null);
  const t = translations[audience];

  return (
    <div className="bg-white shadow-lg w-72 p-6 sticky top-0 h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{t.changeLog}</h2>
        <div className="flex gap-2">
          {Object.keys(changeLog).length > 0 ? (
            <>
              <div className="relative" ref={exportDropdownRef}>
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Share2 className="h-4 w-4 mx-2 text-gray-800" />
                </button>
                {showExportDropdown && (
                  <div className={`absolute ${audience === 'user' ? 'left-0' : 'right-0'} mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50`}>
                    <div className="py-1">
                      <button
                        onClick={handleExport}
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 w-full text-left"
                      >
                        {t.exportToFile}
                      </button>
                      <button
                        onClick={handleEmail}
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 w-full text-left"
                      >
                        {t.exportToEmail}
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
            const totalDaysChange = (change.current.hotDays + change.current.coldDays) - (change.original.hotDays + change.original.coldDays);
            const totalStorageChange = (change.current.elasticStorage + change.current.s3Storage) - (change.original.elasticStorage + change.original.s3Storage);
            const hebrewIndexName = indices.find(index => index.name === indexName)?.hebrewName || indexName;

            return (
              <div key={indexName} className={`text-sm ${audience === 'user' ? 'border-r-2 pr-3' : 'border-l-2 pl-3'} border-blue-500`}>
                <div className="flex justify-between items-start">
                  <div className="font-medium text-gray-800">{audience === 'developer' ? indexName : hebrewIndexName}</div>
                  <button
                    onClick={() => handleRevertChange(indexName)}
                    className="px-2 py-1 text-sm text-gray-500 hover:text-red-500 focus:outline-none"
                  >
                    <Trash2 className="h-4 w-4 mx-2 text-gray-800" />
                  </button>
                </div>
                {audience === 'user' ? (
                  <>
                    <div className="text-gray-600 mt-1">
                      {t.days}: {change.original.hotDays + change.original.coldDays} ← {change.current.hotDays + change.current.coldDays}
                    </div>
                    <div className="font-medium text-gray-800 mt-2">{t.impact}</div>
                    <div className="text-sm ml-2 text-gray-800">
                      {t.storage}: {totalStorageChange > 0 ? '+' : ''}{totalStorageChange} GB
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-gray-600 mt-1">
                      Hot Tier: {change.original.hotDays} → {change.current.hotDays} {t.days}
                    </div>
                    <div className="text-gray-600">
                      Cold Tier: {change.original.coldDays} → {change.current.coldDays} {t.days}
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
