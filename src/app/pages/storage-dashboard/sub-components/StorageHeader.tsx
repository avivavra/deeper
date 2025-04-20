import React, { useState } from 'react';
import { GenericDropdown, ToggleSwitch } from '../../../components';
import { ClusterMetadata, SourceGroup, Audience, Translation } from '../models';
import { GenericModal } from '../../../components/GenericModal';
import { FaInfoCircle } from 'react-icons/fa';

interface StorageHeaderProps {
  clustersMetadata: ClusterMetadata[];
  selectedClusterMetadata: ClusterMetadata;
  setSelectedCluster: (clusterName: string) => void;
  sourceGroups: SourceGroup[];
  selectedSourceGroups: { [key: string]: boolean };
  handleSourceGroupToggle: (name: string) => void;
  isInSimulation: boolean;
  handleModeToggle: () => void;
  translateNames: boolean;
  t: Translation;
  direction: 'ltr' | 'rtl';
}

export const StorageHeader: React.FC<StorageHeaderProps> = ({
  clustersMetadata: clusters,
  selectedClusterMetadata,
  setSelectedCluster,
  sourceGroups,
  selectedSourceGroups,
  handleSourceGroupToggle,
  isInSimulation,
  handleModeToggle,
  translateNames,
  t,
  direction
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="relative title-dropdown flex items-center">
          <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
          <button
            className="ml-2 mr-2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowInfoModal(true)}
            title={t.infoIconTooltip}
          >
            <FaInfoCircle className="text-xl" />
          </button>
        </div>
        <div className="flex gap-4">
          <GenericDropdown
            buttonLabel={translateNames ? selectedClusterMetadata.hebrewName : selectedClusterMetadata.name}
            options={clusters.map(cluster => ({
              label: translateNames ? cluster.hebrewName : cluster.name,
              value: cluster.name,
              checked: selectedClusterMetadata?.name === cluster.name
            }))}
            onSelect={(value) => setSelectedCluster(value)}
            width="w-56"
            type="radio"
          />
          <GenericDropdown
            buttonLabel={t.filterSourceGroups}
            options={sourceGroups.map(sourceGroup => ({
              label: translateNames ? sourceGroup.hebrewName : sourceGroup.name,
              value: sourceGroup.name,
              checked: selectedSourceGroups[sourceGroup.name]
            }))}
            onSelect={(value) => handleSourceGroupToggle(value)}
            width="w-56"
            type="checkbox"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{t.simulation}</span>
            <ToggleSwitch
              checked={isInSimulation}
              onChange={handleModeToggle}
              className={`w-16 h-8 rounded-full relative inline-flex items-center ${isInSimulation ? 'bg-red-500' : 'bg-gray-300'}`}
              direction={direction}
            />
          </div>
        </div>
      </div>
      {showInfoModal && (
        <GenericModal showModal={showInfoModal} setShowModal={setShowInfoModal}>
          <div className="p-8 max-w-3xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{t.explanationTitle}</h2>
            <p className="text-lg text-gray-800" style={{ whiteSpace: 'pre-line' }}>{t.explanationContent}</p>
            <button
              className="mt-6 px-6 py-3 bg-blue-500 text-white rounded text-lg"
              onClick={() => setShowInfoModal(false)}
            >
              {t.close}
            </button>
          </div>
        </GenericModal>
      )}
    </div>
  );
};
