import React from 'react';
import { Pencil, Eye } from 'lucide-react';
import GenericDropdown from '../../components/GenericDropdown';
import { Audience, ClusterData, ClusterMetadata, IndexData, Translation } from './models';

interface StorageHeaderProps {
  audience: Audience;
  setAudience: (audience: Audience) => void;
  clustersMetadata: ClusterMetadata[];
  selectedClusterMetadata: ClusterMetadata;
  setSelectedCluster: (clusterName: string) => void;
  indices: IndexData[];
  selectedIndices: { [key: string]: boolean };
  handleIndexToggle: (indexName: string) => void;
  isEditMode: boolean;
  handleModeToggle: () => void;
  translateIndexNames: boolean;
  t: Translation;
}

const StorageHeader: React.FC<StorageHeaderProps> = ({
  audience,
  setAudience,
  clustersMetadata: clusters,
  selectedClusterMetadata,
  setSelectedCluster,
  indices,
  selectedIndices,
  handleIndexToggle,
  isEditMode,
  handleModeToggle,
  translateIndexNames,
  t
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
            buttonLabel={t.selectCluster}
            options={clusters.map(cluster => ({
              label: translateIndexNames ? cluster.hebrewName : cluster.name,
              value: cluster.name,
              checked: selectedClusterMetadata?.name === cluster.name
            }))}
            onSelect={(value) => setSelectedCluster(value)}
            width="w-56"
            type="radio"
          />
          <GenericDropdown
            buttonLabel={t.filterIndices}
            options={indices.map(index => ({
              label: translateIndexNames ? index.hebrewName : index.name,
              value: index.name,
              checked: selectedIndices[index.name]
            }))}
            onSelect={(value) => handleIndexToggle(value)}
            width="w-56"
            type="checkbox"
          />
          <button
            onClick={handleModeToggle}
            className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isEditMode
              ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500'
              : 'border-gray-300 text-gray-800 bg-white hover:bg-gray-50 focus:ring-blue-500'
              }`}
          >
            {isEditMode ? (
              <>
                <Eye className="h-4 w-4 mx-2 text-gray-800" />
                {t.viewMode}
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mx-2 text-gray-800" />
                {t.editMode}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageHeader;
