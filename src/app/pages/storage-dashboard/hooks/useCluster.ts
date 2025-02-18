import { ClustersApi } from "@/api/clusters/clustersApi";
import { useCallback, useEffect, useState } from "react";
import { ClusterData, ClusterMetadata, IndexData } from "../models";
import useAsyncState from "@/app/utils/useAsyncState";

export const useCluster = (clustersApi: ClustersApi, clustersMetadata: ClusterMetadata[]) => {
  const [selectedClusterMetadata, setSelectedClusterMetadata] = useState<ClusterMetadata>(clustersMetadata[0]);

  const fetchInitialClusterStorage = useCallback(async () => {
    const clustersStorage = await clustersApi.getClusterStorage(clustersMetadata[0].name);

    return {
      ...(clustersMetadata[0]),
      ...clustersStorage
    };
  }, [clustersMetadata, clustersApi]);

  const { state: selectedCluster, fetchData: setSelectedCluster } = useAsyncState<ClusterData>(fetchInitialClusterStorage);

  const handleSetSelectedCluster = useCallback((clusterName: string) => {
    const clusterMetadata = clustersMetadata.find(c => c.name === clusterName);
    if (clusterMetadata) {
      setSelectedClusterMetadata(clusterMetadata);
      setSelectedCluster(async () => {
        const clusterStorage = await clustersApi.getClusterStorage(clusterName);

        return {
          ...clusterMetadata,
          ...clusterStorage
        };
      });
    }
  }, [clustersApi, clustersMetadata, setSelectedCluster]);

  const { state: indices, fetchData: setIndices } = useAsyncState<IndexData[]>([]);

  useEffect(() => {
    setIndices(() => clustersApi.getIndices(selectedClusterMetadata.name));
  }, [setIndices, clustersApi, selectedClusterMetadata.name]);

  const totalElasticStorage = selectedCluster.data?.totalElasticStorage || 0;
  const totalS3Storage = selectedCluster.data?.totalS3Storage || 0;
  const combinedStorage = totalElasticStorage + totalS3Storage;

  return {
    selectedClusterMetadata,
    selectedCluster,
    handleSetSelectedCluster,
    indices,
    totalElasticStorage,
    totalS3Storage,
    combinedStorage
  };
};