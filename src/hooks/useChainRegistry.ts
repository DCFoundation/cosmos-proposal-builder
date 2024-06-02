import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { Apis, ChainItem, NetworkConfig } from '../types/chain';
import { capitalize } from '../utils/capitalize';
import {
  useOptimizedMutation,
  useOptimizedQuery,
} from './useCacheOptimizedQueries';
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { useChainInfo } from './useChainInfo';

interface SuggestEnPointsResponse {
  rpcAddrs: string[];
  apiAddrs: string[];
  chainName: string;
}

export interface RegistryItem extends ChainItem {}

const fetchJSON = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return response.json();
};
const extractNetworks = (registry: RegistryItem): NetworkConfig[] =>
  registry.networks || [];

const PERMITTED_CHAINS_URL =
  'https://raw.githubusercontent.com/gacogo/cosmos-proposal-builder/jeff/community-spend/src/data/permittedChains.json';
const fetchPermittedChains = async () => {
  return fetchJSON(PERMITTED_CHAINS_URL);
};

// export const usePermittedChains = () => {
//   return useOptimizedQuery(['permittedChains'], fetchPermittedChains, {});
// };
export const usePermittedChains = (): UseQueryResult<string[], Error> => {
  return useOptimizedQuery(['permittedChains'], fetchPermittedChains, {});
};

export const fetchChainRegistry = async (
  name: string
): Promise<RegistryItem> => {
  const response = await fetch(
    `https://raw.githubusercontent.com/gacogo/cosmos-proposal-builder/jeff/community-spend/src/data/chains/${name}.json`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch chain registry for ${name}`);
  }
  const registry = await response.json();
  return {
    label: `${capitalize(registry.value)}`,
    value: registry.value,
    href: `/${registry.value}`,
    parent: registry.parent,
    image:
      registry.image ||
      'https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/Agoric-logo-color.svg',
    enabledProposalTypes: registry.enabledProposalTypes,
    networks: registry.networks,
  };
};
export const useChainRegistry = (name: string): UseQueryResult<ChainItem> => {
  return useOptimizedQuery(
    ['chainRegistry', name],
    () => fetchChainRegistry(name),
    { enabled: !!name }
  );
};
const extractNetworkEntries = (
  registry: RegistryItem,
  networkName: string
): NetworkConfig | undefined => {
  return registry.networks?.find(
    (net: NetworkConfig) => net.networkName === networkName
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

const fetchNetworkConfig = async (
  chainName: string,
  networkName: string
): Promise<NetworkConfig | null> => {
  const response = await fetch(
    `https://raw.githubusercontent.com/gacogo/cosmos-proposal-builder/jeff/community-spend/src/data/chains/${chainName}.json`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch chain registry for ${chainName}`);
  }
  const registry = await response.json();
  const networkConfig = registry.networks.find(
    (net: NetworkConfig) => net.networkName === networkName
  );
  return networkConfig || null;
};

// export const useNetworkConfig = (
//   chainName: string,
//   networkName: string
// ): UseQueryResult<NetworkConfig | null> => {
//   return useOptimizedQuery(
//     ['networkConfig', chainName, networkName],
//     ({ queryKey }) => {
//       const [, chainName, networkName] = queryKey as [string, string, string];
//       return fetchNetworkConfig(chainName, networkName);
//     },
//     { enabled: !!chainName && !!networkName }
//   );
// };
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
export const fetchDynamicEndpoints = async (
  url: string
): Promise<SuggestEnPointsResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch dynamic endpoints');
  }
  const data: SuggestEnPointsResponse = await response.json();
  return data;
};

const useSelectedEndpoint = (
  chainName: string,
  networkName: string,
  apiType: keyof Apis
): UseQueryResult<string | null> => {
  const { data: networkConfig } = useNetworkConfig(chainName, networkName);

  const fetchEndpoints = async (): Promise<string[]> => {
    if (networkConfig?.suggestEndpoints) {
      const dynamicEndpoints = await fetchDynamicEndpoints(
        networkConfig.suggestEndpoints
      );
      return apiType === 'rpc'
        ? dynamicEndpoints.rpcAddrs
        : dynamicEndpoints.apiAddrs;
    }
    return networkConfig?.apis?.[apiType]?.map((entry) => entry.address) || [];
  };

  const selectRandomAvailableEndpoint = async (
    endpoints: string[]
  ): Promise<string | null> => {
    for (const endpoint of shuffleArray(endpoints)) {
      if (await checkEndpointAvailability(endpoint)) {
        return endpoint;
      }
    }
    return null;
  };

  /***
   * we are accepting status 200, 204, 501 as valid status as workaround for some endpoints that return 501
   */
  const checkEndpointAvailability = async (url: string): Promise<boolean> => {
    try {
      toast.info(`Checking endpoint availability: ${url}`, {
        autoClose: 500,
      });
      const response = await fetch(url);
      return (
        response.status === 200 ||
        response.status === 204 ||
        response.ok ||
        response.status === 501
      );
    } catch (error) {
      toast.warn(
        `Failed to fetch : ${url} is not availability. Will try another endpoint`,
        {
          autoClose: 500,
        }
      );
      // toast.error(`Failed to check endpoint availability: ${error.message}`);
      return false;
    }
  };

  const shuffleArray = <T>(array: T[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    console.error('Shuffled array is ', array);
    return array;
  };

  const selectEndpointMutation = useOptimizedMutation<
    string | null,
    Error,
    string[]
  >(async (endpoints) => {
    const selectedEndpoint = await selectRandomAvailableEndpoint(endpoints);
    if (!selectedEndpoint) {
      throw new Error(`No available ${apiType} endpoint found`);
    }
    toast.success(`Using endpoint ${selectedEndpoint}`, {
      autoClose: 1000,
    });

    return selectedEndpoint;
  }, {});

  const queryResult = useOptimizedQuery<string | null, Error>(
    ['selectedEndpoint', chainName, networkName, apiType],
    async () => {
      const endpoints = await fetchEndpoints();
      return selectEndpointMutation.mutateAsync(endpoints);
    },
    { enabled: !!networkConfig }
  );

  return queryResult;
};

export const useRpcEntry = (
  chainName: string,
  networkName: string
): UseQueryResult<string | null> => {
  return useSelectedEndpoint(chainName, networkName, 'rpc');
};

export const useRestApi = (
  chainName: string,
  networkName: string
): UseQueryResult<string | null> => {
  return useSelectedEndpoint(chainName, networkName, 'rest');
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
