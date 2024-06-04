import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { ChainItem, NetworkConfig } from '../types/chain';
import { useOptimizedQuery } from './useCacheOptimizedQueries';
import { useMemo } from 'react';
import { useChainInfo } from './useChainInfo';
import {
  extractNetworkEntries,
  extractNetworks,
  fetchChainRegistry,
  fetchNetworkConfig,
  fetchPermittedChains,
} from '../lib/chainConfigUtils';

export const usePermittedChains = (): UseQueryResult<string[], Error> => {
  return useOptimizedQuery(['permittedChains'], fetchPermittedChains, {});
};

export const useChainRegistry = (name: string): UseQueryResult<ChainItem> => {
  return useOptimizedQuery(
    ['chainRegistry', name],
    () => fetchChainRegistry(name),
    { enabled: !!name }
  );
};

export const useNetworks = (
  chainName: string
): UseQueryResult<NetworkConfig[]> => {
  return useOptimizedQuery(
    ['networks', chainName],
    async () => {
      const registry = await fetchChainRegistry(chainName);
      return extractNetworks(registry);
    },
    { enabled: !!chainName }
  );
};

export const useNetworkEntries = (
  chainName: string,
  networkName: string
): UseQueryResult<NetworkConfig | undefined> => {
  return useOptimizedQuery(
    ['networkEntries', chainName, networkName],
    async () => {
      const registry = await fetchChainRegistry(chainName);
      return extractNetworkEntries(registry, networkName);
    },
    { enabled: !!chainName && !!networkName }
  );
};

export const useNetworkConfig = (
  chainName: string,
  networkName: string
): UseQueryResult<NetworkConfig | null> => {
  return useOptimizedQuery(
    ['networkConfig', chainName, networkName],
    () => fetchNetworkConfig(chainName, networkName),
    { enabled: !!chainName && !!networkName }
  );
};

export const useNetworkData = (
  chainName: string | null,
  networkName: string | null
) => {
  const {
    data: chainItem,
    isLoading: isChainItemLoading,
    error: chainItemError,
  } = useChainRegistry(chainName!);
  const {
    data: networkConfig,
    isLoading: isNetworkConfigLoading,
    error: networkConfigError,
  } = useNetworkEntries(chainName!, networkName!);

  const {
    data: chainInfo,
    isLoading: isChainInfoLoading,
    error: chainInfoError,
  } = useChainInfo(chainName as string, networkName as string);

  const chainNetworkNames = useMemo(() => {
    return chainItem?.networks?.map((n) => n.networkName) || [];
  }, [chainItem]);

  const isLoading = useMemo(() => {
    return (
      !!chainName &&
      !!networkName &&
      (isChainItemLoading || isNetworkConfigLoading || isChainInfoLoading)
    );
  }, [
    chainName,
    networkName,
    isChainItemLoading,
    isNetworkConfigLoading,
    isChainInfoLoading,
  ]);

  const error = useMemo(() => {
    return chainItemError || networkConfigError || chainInfoError;
  }, [chainItemError, networkConfigError, chainInfoError]);

  return {
    currentChainItem: chainItem,
    chainInfo,
    networkConfig,
    chainNetworkNames,
    isLoading,
    error,
  };
};

// chainRegistry is a JSON file that contains information about the chain
export const useChainRegistries = (): {
  data?: ChainItem[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
} => {
  const {
    data: permittedChains,
    isLoading: isPermittedChainsLoading,
    isError: isPermittedChainsError,
    isFetching: isPermittedChainsFetching,
  } = usePermittedChains();

  const chainQueries = useQueries({
    queries: (permittedChains || []).map((name) => ({
      queryKey: ['chainRegistry', name],
      queryFn: () => fetchChainRegistry(name),
      enabled: !!permittedChains,
      staleTime: Infinity, // Data remains fresh indefinitely
      cacheTime: 5 * 60 * 1000, // Cache data for 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    })),
  });

  const isLoading =
    isPermittedChainsLoading ||
    chainQueries.some((query) => query.isLoading || query.isPending);
  const isError =
    isPermittedChainsError || chainQueries.some((query) => query.isError);
  const isFetching =
    isPermittedChainsFetching || chainQueries.some((query) => query.isFetching);
  const data = chainQueries
    .map((query) => query.data)
    .filter(Boolean) as ChainItem[];

  return { data, isLoading, isError, isFetching };
};
