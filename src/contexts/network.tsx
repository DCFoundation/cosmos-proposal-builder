import { ReactNode, createContext, useCallback, useMemo } from "react";
import {
  fetchChainConfig,
  fetchNetworksForChain,
  makeChainInfo,
  NetworkConfig,
} from "../config/chainConfig";
import { useChain } from "../hooks/useChain";
import { useSearch } from "wouter/use-location";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export interface NetworkContextValue {
  chainNetworkNames: string[] | null;
  currentNetworkName: string | null;
  networkConfig: NetworkConfig | null;
  error: Error | null;
  api: string | undefined;
  setCurrentNetworkName: (network: string) => void;
  isLoading: boolean;
  chainInfo: ReturnType<typeof makeChainInfo> | null;
}

export const NetworkContext = createContext<NetworkContextValue | null>(null);

export const NetworkContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { currentChain } = useChain();
  const [, setLocation] = useLocation();

  const search = useSearch();
  const selectedNetwork = useMemo(
    () => new URLSearchParams(search).get("network") ?? null,
    [search],
  );

  const {
    data: networksList = [],
    isLoading: isLoadingNetworks,
    error: networksFetchError,
  } = useQuery({
    queryKey: ["networksForChain", currentChain?.parent ?? "-"],
    queryFn: () =>
      !currentChain ? null : fetchNetworksForChain(currentChain.parent),
  });

  const {
    data: networkConfig = null,
    isLoading: isLoadingChainConfig,
    error: networkConfigError,
  } = useQuery({
    queryKey: ["networkConfig", currentChain?.parent, selectedNetwork],
    queryFn: () =>
      !currentChain || !selectedNetwork
        ? null
        : fetchChainConfig(currentChain.parent, selectedNetwork),
  });

  const restApi = useMemo(() => {
    if (selectedNetwork === "local") return "http://localhost:1317";
    return networkConfig?.apis.rest[0].address;
  }, [networkConfig, selectedNetwork]);

  const setNetwork = useCallback(
    (network: string) => {
      if (currentChain) {
        setLocation(`/${currentChain.value}?network=${network}`);
      }
    },
    [currentChain, setLocation],
  );

  const chainInfo = useMemo(
    () => (!networkConfig ? null : makeChainInfo(networkConfig)),
    [networkConfig],
  );

  return (
    <NetworkContext.Provider
      value={{
        chainNetworkNames: networksList,
        error: networkConfigError || networksFetchError,
        currentNetworkName: selectedNetwork,
        networkConfig: networkConfig,
        api: chainInfo?.rest || restApi, // TODO remove as we have it on chainInfo
        setCurrentNetworkName: setNetwork,
        isLoading: isLoadingChainConfig || isLoadingNetworks,
        chainInfo: chainInfo,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
