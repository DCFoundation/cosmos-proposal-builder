import { createContext, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { fetchAvailableChains } from "../config/chainConfig";
import { useQuery, UseQueryResult, QueryKey } from "@tanstack/react-query";

/**
 * Some chains have a parent chain. We use parent to fetch configs and data.
 * We however still use chain value for routing and related functions. example is inter(child) and agoric(parent)
 */
export type ChainListItem = {
  label: string;
  value: string;
  href: string;
  parent: ChainListItem["value"];
  image: string;
};

export interface ChainContextValue {
  currentChain: ChainListItem | null;
  availableChains: ChainListItem[];
  setCurrentChain: (chain: ChainListItem) => void;
}

export const ChainContext = createContext<ChainContextValue | null>(null);

export const ChainContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [location, setLocation] = useLocation();
  const chainName = location.split("/")[1];

  const {
    data: chainList = [],
    isLoading: isLoadingChains,
    error,
  }: UseQueryResult<ChainListItem[], Error> = useQuery<ChainListItem[], Error>({
    queryKey: ["availableChains"] as QueryKey,
    queryFn: () => fetchAvailableChains(),
  });

  const setChain = useCallback(
    (chain: ChainListItem) => {
      setLocation(`/${chain.value}`);
    },
    [setLocation],
  );
  const currentChain: ChainListItem | undefined = useMemo(
    () => chainList.find((chain) => chain.value === chainName),
    [chainName, chainList],
  );

  //dirty temporary fix to appease linter - fix later
  if (isLoadingChains) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <ChainContext.Provider
      value={{
        currentChain: currentChain || null,
        availableChains: chainList,
        setCurrentChain: setChain,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
};
