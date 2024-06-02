import { createContext, ReactNode, useCallback, useMemo } from 'react';
import { ChainItem, NetworkConfig } from '../types/chain';
import { useChain } from '../hooks/useChain';
import { useSearch } from 'wouter/use-location';
import { ChainInfo } from '@keplr-wallet/types';
import { useLocation } from 'wouter';
import { useNetworkData } from '../hooks/useChainRegistry';

export interface NetworkContextValue {
  chainNetworkNames: string[] | null;
  currentNetworkName: string | null;
  networkConfig: NetworkConfig | null;
  setCurrentNetworkName: (network: string) => void;
  chainInfo: ChainInfo | null;
  isLoading: boolean;
  error: Error | null;
  currentChain: ChainItem | null;
  api: string | null;
}

export const NetworkContext = createContext<NetworkContextValue | null>(null);

export const NetworkContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { currentChain: currentChainName } = useChain();
  const [, setLocation] = useLocation();
  const search = useSearch();

  const selectedNetwork = useMemo(
    () => new URLSearchParams(search).get('network') ?? null,
    [search]
  );

  const setNetwork = useCallback(
    (network: string) => {
      if (currentChainName) {
        setLocation(`/${currentChainName}?network=${network}`);
      }
    },
    [currentChainName, setLocation]
  );

  const {
    currentChainItem,
    chainInfo,
    networkConfig,
    chainNetworkNames,
    isLoading,
    error,
  } = useNetworkData(currentChainName, selectedNetwork);

  return (
    <NetworkContext.Provider
      value={{
        chainNetworkNames: chainNetworkNames || null,
        currentNetworkName: selectedNetwork,
        networkConfig: networkConfig !== undefined ? networkConfig : null,
        setCurrentNetworkName: setNetwork,
        chainInfo: chainInfo !== undefined ? chainInfo : null,
        isLoading,
        error: error ?? null,
        currentChain: currentChainItem !== undefined ? currentChainItem : null,
        api: chainInfo?.rest ?? null,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
