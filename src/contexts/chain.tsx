import { createContext, ReactNode, useCallback, useMemo } from "react";
import { useLocation } from "wouter";

import { CHAINS } from "../constants/chains";
import { ChainItem } from "../types/chain";

export interface ChainContextValue {
  currentChain: ChainItem | null;
  setCurrentChain: (chain: string) => void;
}

export const ChainContext = createContext<ChainContextValue | null>(null);

export const ChainContextProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useLocation();
  const chainName = location.split("/")[1];

  const setChain = useCallback(
    (chain: string) => {
      setLocation(`/${chain}`);
    },
    [setLocation]
  );

  const currentChain = useMemo(
    () => CHAINS.find((c) => c.value === chainName) ?? null,
    [chainName]
  );

  // console.error("current chain info from chain context is ", currentChain);

  return (
    <ChainContext.Provider
      value={{
        currentChain,
        setCurrentChain: setChain,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
};
