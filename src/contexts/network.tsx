import { ReactNode, createContext, useEffect, useMemo, useState } from "react";
import { useSearch } from "wouter/use-location";
import { toast } from "react-toastify";
import { fetchChainConfig, NetworkConfig } from "../config/chainConfig";
import { useChain } from "../hooks/useChain";

export interface NetworkContextValue {
  currentNetworkName: string | null;
  siblingNetworkNames: string[];
  networkConfig: NetworkConfig | null;
  error: string | null;
  api: string | undefined;
}

export const NetworkContext = createContext<NetworkContextValue>({
  currentNetworkName: null,
  siblingNetworkNames: [],
  networkConfig: null,
  error: null,
  api: undefined,
});

export const NetworkContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [currentNetworkName, setCurrentNetworkName] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig | null>(
    null,
  );
  const { currentChainName, networksForCurrentChain } = useChain();
  const search = useSearch();
  const selectedNetwork = useMemo(
    () => new URLSearchParams(search).get("network") ?? null,
    [search],
  );

  useEffect(() => {
    if (selectedNetwork && networksForCurrentChain.includes(selectedNetwork)) {
      setCurrentNetworkName(selectedNetwork);
    }
  }, [selectedNetwork, networksForCurrentChain]);

  useEffect(() => {
    if (currentNetworkName && currentChainName) {
      fetchChainConfig(currentChainName, currentNetworkName)
        .then(setNetworkConfig)
        .catch(() => {
          setNetworkConfig(null);
          setError("Failed to fetch network configuration.");
          toast.error("Failed to fetch network configuration.", {
            position: "bottom-center",
            autoClose: 300,
          });
        });
    }
  }, [currentChainName, currentNetworkName]);

  const restApi = useMemo(() => {
    if (currentNetworkName === "local") return "http://localhost:1317";
    return networkConfig?.apis.rest[0].address;
  }, [networkConfig, currentNetworkName]);

  return (
    <NetworkContext.Provider
      value={{
        currentNetworkName,
        siblingNetworkNames: networksForCurrentChain,
        networkConfig,
        error,
        api: restApi,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
