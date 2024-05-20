import { ReactNode, createContext, useCallback, useMemo } from "react";
import { makeChainInfo } from "../config/chainConfig";
import { useChain } from "../hooks/useChain";
import { useSearch } from "wouter/use-location";
import { useLocation } from "wouter";
import { NetworkConfig } from "../types/chain";

export interface NetworkContextValue {
  chainNetworkNames: string[] | null;
  currentNetworkName: string | null;
  networkConfig: NetworkConfig | null;
  api: string | undefined;
  setCurrentNetworkName: (network: string) => void;
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
    [search]
  );

  const networksList = useMemo(
    () => currentChain?.networks.map((n) => n.networkName) ?? null,
    [currentChain?.networks]
  );

  const networkConfig = useMemo(
    () =>
      !currentChain || !selectedNetwork
        ? null
        : currentChain.networks.find(
            (n) => n.networkName === selectedNetwork
          ) ?? null,
    []
  );

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
    [currentChain, setLocation]
  );

  const chainInfo = useMemo(
    () => (!networkConfig ? null : makeChainInfo(networkConfig)),
    [networkConfig]
  );

  return (
    <NetworkContext.Provider
      value={{
        chainNetworkNames: networksList,
        currentNetworkName: selectedNetwork,
        networkConfig: networkConfig,
        api: chainInfo?.rest || restApi, // TODO remove as we have it on chainInfo
        setCurrentNetworkName: setNetwork,
        chainInfo: chainInfo,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
