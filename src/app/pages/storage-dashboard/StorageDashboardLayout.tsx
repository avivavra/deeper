import React from 'react';

type StorageDashboardLayoutProps = {
  header: React.ReactNode;
  storageUsage: React.ReactNode;
  chart: React.ReactNode;
  retentionManagement: React.ReactNode;
  changeLog?: React.ReactNode;
  isEditMode: boolean;
};

const StorageDashboardLayout: React.FC<StorageDashboardLayoutProps> = ({
  header,
  storageUsage,
  chart,
  retentionManagement,
  changeLog,
  isEditMode,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 shadow-sm">
        {header}
      </div>
      <div className="flex">
        {isEditMode && changeLog && (
          <div className="w-72 bg-white shadow-lg p-6">
            {changeLog}
          </div>
        )}
        <div className={`flex-grow p-6 space-y-6 ${isEditMode ? 'lg:w-[calc(100%-20rem)]' : ''}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {storageUsage}
            </div>
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              {chart}
            </div>
          </div>
          <div className={`bg-white rounded-lg shadow-sm p-6 ${isEditMode ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            {retentionManagement}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageDashboardLayout;
