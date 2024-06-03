import { createContext, ReactNode, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useChainRegistries } from '../hooks/useChainRegistry';

export interface ChainContextValue {
  currentChain: string | null;
  setCurrentChain: (chain: string, network?: string) => void;
}

export const ChainContext = createContext<ChainContextValue | null>(null);

export const ChainContextProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useLocation();

  const {
    data: chains = [],
    isLoading: isLoadingChains,
    isError: chainLoadingError,
  } = useChainRegistries();

  const chainName = useMemo(() => {
    const name = location.split('/')[1];
    return chains.find((chain) => chain.value === name) ? name : null;
  }, [location, chains]);

  const setCurrentChain = useCallback(
    (chain: string, network?: string) => {
      if (chains.find((c) => c.value === chain)) {
        setLocation(`/${chain}?network=${network || 'mainnet'}`);
      }
    },
    [chains, setLocation]
  );

  if (isLoadingChains) {
    return <div>Loading chain...</div>;
  }

  if (chainLoadingError) {
    return <div>Error loading chain...</div>;
  }

  return (
    <ChainContext.Provider
      value={{
        currentChain: chainName,
        setCurrentChain,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
};
