import React, { useState } from 'react';
import { GenericModal } from '../../components/GenericModal';
import { FaExpand } from 'react-icons/fa';

type StorageDashboardLayoutProps = {
  header: React.ReactNode;
  storageUsage: React.ReactNode;
  chart: React.ReactNode;
  retentionManagement: React.ReactNode;
  changeLog?: React.ReactNode;
  isInSimulation: boolean;
};

export const StorageDashboardLayout: React.FC<StorageDashboardLayoutProps> = ({
  header,
  storageUsage,
  chart,
  retentionManagement,
  changeLog,
  isInSimulation,
}) => {
  const [isStorageUsageModalOpen, setStorageUsageModalOpen] = useState(false);
  const [isChartModalOpen, setChartModalOpen] = useState(false);
  const [isRetentionModalOpen, setRetentionModalOpen] = useState(false);

  const storageUsageActionButtons = (
    <button
      className="text-gray-500 hover:text-gray-700"
      onClick={() => setStorageUsageModalOpen(true)}
    >
      <FaExpand size={20} />
    </button>
  );

  const chartActionButtons = (
    <button
      className="text-gray-500 hover:text-gray-700"
      onClick={() => setChartModalOpen(true)}
    >
      <FaExpand size={20} />
    </button>
  );

  const retentionManagementActionButtons = (
    <button
      className="text-gray-500 hover:text-gray-700"
      onClick={() => setRetentionModalOpen(true)}
    >
      <FaExpand size={20} />
    </button>
  );

  const filterProps = (element: React.ReactNode) => {
    if (React.isValidElement(element)) {
      const { actionButtons, ...rest } = element.props;
      return React.cloneElement(element, rest);
    }
    return element;
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <div className="bg-white border-b px-6 py-4 shadow-sm fixed w-full z-10" style={{ height: '70px' }}>
        {header}
      </div>
      <div className="flex flex-grow pt-16 overflow-hidden" style={{ paddingTop: '70px' }}>
        <div className={`flex-grow p-6 space-y-6 overflow-hidden ${isInSimulation ? 'lg:w-[calc(100%-20rem)]' : ''}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 70px - 70px - 120px)' }}>
              {React.cloneElement(chart, { actionButtons: chartActionButtons })}
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 70px - 70px - 120px)' }}>
              {React.cloneElement(storageUsage, { actionButtons: storageUsageActionButtons })}
            </div>
          </div>
          <div className={`bg-white rounded-lg shadow-lg p-6 flex-grow overflow-y-auto relative`} style={{ maxHeight: 'calc(100vh - 70px - 70px - 300px - 60px)' }}>
            {React.cloneElement(retentionManagement, { actionButtons: retentionManagementActionButtons })}
          </div>
        </div>
        {isInSimulation && changeLog && (
          <div className="w-72 bg-white shadow-lg p-6 overflow-y-auto flex-grow" style={{ maxHeight: 'calc(100vh - 70px)' }}>
            {changeLog}
          </div>
        )}
      </div>
      <GenericModal showModal={isStorageUsageModalOpen} setShowModal={setStorageUsageModalOpen} width="60rem">
        <div className="p-6" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          {filterProps(storageUsage)}
        </div>
      </GenericModal>
      <GenericModal showModal={isChartModalOpen} setShowModal={setChartModalOpen} width="80rem">
        <div className="p-6" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          {filterProps(chart)}
        </div>
      </GenericModal>
      <GenericModal showModal={isRetentionModalOpen} setShowModal={setRetentionModalOpen} width="100rem">
        <div className="p-6" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          {filterProps(retentionManagement)}
        </div>
      </GenericModal>
    </div>
  );
};
