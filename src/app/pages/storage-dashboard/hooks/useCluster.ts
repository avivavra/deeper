import { ClusterSummarizerFactory } from "../../../../api";
import { useCallback, useEffect, useState } from "react";
import { ClusterData, ClusterMetadata, SourceGroup } from "../models";
import { useAsyncState } from "../../../utils";

export const useCluster = (clustersSummarizerFactory: ClusterSummarizerFactory, clustersMetadata: ClusterMetadata[], defaultClusterName?: string) => {
  const defaultCluster = clustersMetadata.find(cluster => cluster.name === defaultClusterName) || clustersMetadata[0];
  const [selectedClusterMetadata, setSelectedClusterMetadata] = useState<ClusterMetadata>(defaultCluster);

  const fetchInitialClusterStorage = useCallback(async () => {
    const summarizer = clustersSummarizerFactory.createSummarizer(defaultCluster.name);
    const clustersStorage = await summarizer.summarize();

    return {
      ...defaultCluster,
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

  const { state: sourceGroups, fetchData: setSourceGroups } = useAsyncState<SourceGroup[]>([]);

  useEffect(() => {
    setSourceGroups(async () => {
      const summarizer = clustersSummarizerFactory.createSummarizer(selectedClusterMetadata.name);
      const fetchedSourceGroups = await summarizer.summarizeSourceGroups();

      return fetchedSourceGroups.sort((a, b) => b.elasticStorage - a.elasticStorage);
    });
  }, [setSourceGroups, clustersSummarizerFactory, selectedClusterMetadata.name]);

  const totalElasticStorage = selectedCluster.data?.totalElasticStorage || 0;
  const totalS3Storage = selectedCluster.data?.totalS3Storage || 0;

  return {
    selectedClusterMetadata,
    selectedCluster,
    handleSetSelectedCluster,
    sourceGroups,
    totalElasticStorage,
    totalS3Storage,
  };
};