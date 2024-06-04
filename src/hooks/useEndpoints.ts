import { UseQueryResult } from '@tanstack/react-query';
import { useNetworkConfig } from './useChainRegistry';
import { Apis } from '../types/chain';
import { toast } from 'react-toastify';
import {
  useOptimizedMutation,
  useOptimizedQuery,
} from './useCacheOptimizedQueries';
import {
  fetchEndpoints,
  selectRandomAvailableEndpoint,
} from '../lib/chainConfigUtils';

const useSelectedEndpoint = (
  chainName: string,
  networkName: string,
  apiType: keyof Apis
): UseQueryResult<string | null> => {
  const { data: networkConfig } = useNetworkConfig(chainName, networkName);

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
      const endpoints = await fetchEndpoints(
        apiType,
        networkConfig ?? undefined
      );
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
