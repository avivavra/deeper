import React from 'react';

type StorageDashboardLayoutProps = {
  header: React.ReactNode;
  storageUsage: React.ReactNode;
  chart: React.ReactNode;
  retentionManagement: React.ReactNode;
  changeLog?: React.ReactNode;
  isEditMode: boolean;
};

export const StorageDashboardLayout: React.FC<StorageDashboardLayoutProps> = ({
  header,
  storageUsage,
  chart,
  retentionManagement,
  changeLog,
  isEditMode,
}) => {
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <div className="bg-white border-b px-6 py-4 shadow-sm fixed w-full z-10" style={{ height: '70px' }}>
        {header}
      </div>
      <div className="flex flex-grow pt-16 overflow-hidden" style={{ paddingTop: '70px' }}>
        <div className={`flex-grow p-6 space-y-6 overflow-hidden ${isEditMode ? 'lg:w-[calc(100%-20rem)]' : ''}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 70px - 70px - 120px)' }}>
              {chart}
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 70px - 70px - 120px)' }}>
              {storageUsage}
            </div>
          </div>
          <div className={`bg-white rounded-lg shadow-lg p-6 flex-grow overflow-y-auto`} style={{ maxHeight: 'calc(100vh - 70px - 70px - 300px - 60px)' }}>
            {retentionManagement}
          </div>
        </div>
        {isEditMode && changeLog && (
          <div className="w-72 bg-white shadow-lg p-6 overflow-y-auto flex-grow" style={{ maxHeight: 'calc(100vh - 70px)' }}>
            {changeLog}
          </div>
        )}
      </div>
    </div>
  );
};
