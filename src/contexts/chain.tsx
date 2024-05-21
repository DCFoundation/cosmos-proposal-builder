import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useLocation } from "wouter";

import { ChainItem } from "../types/chain";
import { getChains } from "../constants/chains";

export interface ChainContextValue {
  currentChain: ChainItem | null;
  setCurrentChain: (chain: string) => void;
  chains: Array<{ value: string; label: string; image?: string }>;
}

export const ChainContext = createContext<ChainContextValue | null>(null);

export const ChainContextProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useLocation();
  const chainName = location.split("/")[1];
  const [currentChain, setCurrentChain] = useState<ChainItem | null>(null);
  const [chains, setChains] = useState<
    Array<{ value: string; label: string; image?: string }>
  >([]);

  const setCurrentChainName = useCallback(
    (chain: string) => {
      setLocation(`/${chain}?network=mainnet`);
    },
    [setLocation]
  );
  useEffect(() => {
    async function fetchChains() {
      const chainsData = await getChains();
      setChains(chainsData);
    }

    fetchChains();
  }, []);

  useEffect(() => {
    async function fetchCurrentChain() {
      const CHAINS = await getChains();
      const chain = CHAINS.find((c) => c.value === chainName) ?? null;
      setCurrentChain(chain);
    }

    fetchCurrentChain();
  }, [chainName]);

  return (
    <ChainContext.Provider
      value={{
        chains,
        currentChain,
        setCurrentChain: setCurrentChainName,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
};
