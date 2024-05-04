import { Bech32Config } from "@keplr-wallet/types";

export interface ApiEntry {
    address: string;
    provider?: string;
  }
  
  export interface Apis {
    rpc: ApiEntry[];
    rest: ApiEntry[];
    grpc: ApiEntry[];
  }
  
  export interface NetworkConfig {
    chainName: string;
    chainId: string;
    networkName: string;
    apis: Apis;
    logoURIs?: string[];
  }
  
  export interface ChainConfig {
    chain_name: string;
    networks: NetworkConfig[];
  }

  export const fetchApprovedChains = async (): Promise<string[]> => {
    return ["agoric", "cosmoshub", "juno", "osmosis"];
  };
  
  export const getChainNameFromLocation = async (location: string): Promise<string | null> => {
    const pathname = location.slice(1);
    return fetchApprovedChains().then((chains) => (chains.includes(pathname) ? pathname : null));
  };
  
  export const fetchNetworksForChain = async (chainName: string): Promise<string[]> => {
    try {
      const { default: networks } = await import(`../chainConfig/${chainName}/index.json`);
      return networks;
    } catch (error) {
      console.error(`Failed to fetch networks for chain ${chainName}:`, error);
      return [];
    }
  };
  
  export const generateBech32Config = (bech32Prefix: string): Bech32Config => ({
    bech32PrefixAccAddr: bech32Prefix,
    bech32PrefixAccPub: `${bech32Prefix}pub`,
    bech32PrefixValAddr: `${bech32Prefix}valoper`,
    bech32PrefixValPub: `${bech32Prefix}valoperpub`,
    bech32PrefixConsAddr: `${bech32Prefix}valcons`,
    bech32PrefixConsPub: `${bech32Prefix}valconspub`,
  });

  export const fetchChainConfig = async (chainName: string, networkName: string): Promise<NetworkConfig> => {
    const fetchedConfig: NetworkConfig = await import(`../chainConfig/${chainName}/${networkName}/chain.json`);
    return fetchedConfig;
  };