import { ClusterSummarizerFactory } from "@/api/summary/clusterSummarizerFactory";
import { useCallback, useEffect, useState } from "react";
import { ClusterData, ClusterMetadata, IndexData } from "../models";
import useAsyncState from "@/app/utils/useAsyncState";

export const useCluster = (clustersSummarizerFactory: ClusterSummarizerFactory, clustersMetadata: ClusterMetadata[]) => {
  const [selectedClusterMetadata, setSelectedClusterMetadata] = useState<ClusterMetadata>(clustersMetadata[0]);

  const fetchInitialClusterStorage = useCallback(async () => {
    const summarizer = clustersSummarizerFactory.createSummarizer(clustersMetadata[0].name);
    const clustersStorage = await summarizer.summarize();

    return {
      ...(clustersMetadata[0]),
      ...clustersStorage
    };
  }, [clustersMetadata, clustersSummarizerFactory]);

  const { state: selectedCluster, fetchData: setSelectedCluster } = useAsyncState<ClusterData>(fetchInitialClusterStorage);

  const handleSetSelectedCluster = useCallback((clusterName: string) => {
    const clusterMetadata = clustersMetadata.find(c => c.name === clusterName);
    if (clusterMetadata) {
      setSelectedClusterMetadata(clusterMetadata);
      setSelectedCluster(async () => {
        const summarizer = clustersSummarizerFactory.createSummarizer(clusterName);
        const clusterStorage = await summarizer.summarize();

        return {
          ...clusterMetadata,
          ...clusterStorage
        };
      });
    }
  }, [clustersSummarizerFactory, clustersMetadata, setSelectedCluster]);

  const { state: indices, fetchData: setIndices } = useAsyncState<IndexData[]>([]);

  useEffect(() => {
    setIndices(async () => {
      const summarizer = clustersSummarizerFactory.createSummarizer(selectedClusterMetadata.name);
      return summarizer.summarizeIndices();
    });
  }, [setIndices, clustersSummarizerFactory, selectedClusterMetadata.name]);

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