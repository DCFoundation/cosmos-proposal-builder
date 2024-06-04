import { toast } from 'react-toastify';
// import { fetchDynamicEndpoints } from '../hooks/useChainRegistry';
import { Apis, ChainItem, NetworkConfig } from '../types/chain';
import { capitalize } from '../utils/capitalize';
import {
  CHAIN_DATA_URL,
  PERMITTED_CHAINS_URL,
} from '../constants/registryPath';

interface SuggestEnPointsResponse {
  rpcAddrs: string[];
  apiAddrs: string[];
  chainName: string;
}

export interface RegistryItem extends ChainItem {}

const hasParent = (chainItem: ChainItem) => !!chainItem.parent;

export const extractNetworkEntries = (
  registry: RegistryItem,
  networkName: string
): NetworkConfig | undefined => {
  return registry.networks?.find(
    (net: NetworkConfig) => net.networkName === networkName
  );
};
export const fetchEndpoints = async (
  apiType: keyof Apis,
  networkConfig?: NetworkConfig
): Promise<string[]> => {
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
export const selectRandomAvailableEndpoint = async (
  endpoints: string[]
): Promise<string | null> => {
  for (const endpoint of shuffleArray(endpoints)) {
    if (await checkEndpointAvailability(endpoint)) {
      return endpoint;
    }
  }
  return null;
};
const shuffleArray = <T>(array: T[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  console.error('Shuffled array is ', array);
  return array;
};
export const fetchChainRegistry = async (
  name: string
): Promise<RegistryItem> => {
  const registry = await fetchJSON(`${CHAIN_DATA_URL}/${name}.json`);

  const registryItem = {
    label: `${capitalize(registry.value)}`,
    value: registry.value,
    href: `/${registry.value}`,
    parent: registry.parent,
    image: registry.image || 'https://placehold.it/320x150',
    enabledProposalTypes: registry.enabledProposalTypes,
    networks: registry.networks ?? [],
  };

  if (hasParent(registry)) {
    const parentRegistry = await fetchJSON(
      `${CHAIN_DATA_URL}/${registry.parent}.json`
    );
    if (parentRegistry && parentRegistry.networks) {
      registryItem.networks = [
        ...registryItem.networks,
        ...parentRegistry.networks,
      ];
    }
  }

  return registryItem;
};

export const fetchNetworkConfig = async (
  chainName: string,
  networkName: string
): Promise<NetworkConfig | null> => {
  const registry = await fetchChainRegistry(chainName);
  const networkConfig = registry.networks?.find(
    (net: NetworkConfig) => net.networkName === networkName
  );
  return networkConfig || null;
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

const checkEndpointAvailability = async (url: string): Promise<boolean> => {
  try {
    toast.info(`Checking endpoint availability: ${url}`, {
      autoClose: 500,
    });
    const response = await fetch(url);
    return response.status === 200 || response.ok || response.status === 501;
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

const fetchJSON = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return response.json();
};

export const extractNetworks = (registry: RegistryItem): NetworkConfig[] =>
  registry.networks || [];

export const fetchPermittedChains = async () => {
  return fetchJSON(PERMITTED_CHAINS_URL);
};
