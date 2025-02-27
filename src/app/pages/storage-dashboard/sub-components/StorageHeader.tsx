import React from 'react';
import { GenericDropdown, ToggleSwitch } from '../../../components';
import { ClusterMetadata, SourceGroup, Audience, Translation } from '../models';

interface StorageHeaderProps {
  audience: Audience;
  setAudience: (audience: Audience) => void;
  clustersMetadata: ClusterMetadata[];
  selectedClusterMetadata: ClusterMetadata;
  setSelectedCluster: (clusterName: string) => void;
  sourceGroups: SourceGroup[];
  selectedSourceGroups: { [key: string]: boolean };
  handleSourceGroupToggle: (name: string) => void;
  isEditMode: boolean;
  handleModeToggle: () => void;
  translateNames: boolean;
  t: Translation;
  direction: 'ltr' | 'rtl'; // Add direction prop
}

export const StorageHeader: React.FC<StorageHeaderProps> = ({
  audience,
  setAudience,
  clustersMetadata: clusters,
  selectedClusterMetadata,
  setSelectedCluster,
  sourceGroups,
  selectedSourceGroups,
  handleSourceGroupToggle,
  isEditMode,
  handleModeToggle,
  translateNames,
  t,
  direction // Add direction prop
}) => {
  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="relative title-dropdown">
          <GenericDropdown
            buttonLabel={t.title}
            options={[
              { label: t.developerMode, value: 'developer', checked: audience === 'developer' },
              { label: t.userMode, value: 'user', checked: audience === 'user' }
            ]}
            onSelect={(value) => setAudience(value as Audience)}
            width="w-56"
            type="radio"
          />
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
            <span className="text-sm font-medium text-gray-700">{t.editMode}</span>
            <ToggleSwitch
              checked={isEditMode}
              onChange={handleModeToggle}
              className={`w-16 h-8 rounded-full relative inline-flex items-center ${isEditMode ? 'bg-red-500' : 'bg-gray-300'}`}
              direction={direction} // Pass direction prop
            />
          </div>
        </div>
      </div>
    </div>
  );
};
