import { ReactNode, createContext, useEffect, useMemo, useState } from "react";
import { getNetworkConfig } from "../lib/getNetworkConfig";
import { useSearch } from "wouter/use-location";
import { toast } from "react-toastify";
import { ChainName, getNetworksForChain } from "./chain";
import { useChain } from "../hooks/useChain";

export type NetNames = Record<string, string[]>;
export const NETNAMES: NetNames = {
  agoric: ["local", "devnet", "ollinet", "xnet", "emerynet", "main"] as const,
  cosmos: ["cosmoshub-mainnet", "cosmoshub-devnet", "cosmoshub-local"] as const,
  inter: [],
};

NETNAMES.inter = [...NETNAMES.agoric] as const;

export type NetName = (typeof NETNAMES)[keyof typeof NETNAMES][number];

interface NetworkContext {
  chain: ChainName | undefined;
  netName: NetName | undefined;
  netNames: NetName[];
  networkConfig: NetworkConfig | null;
  error: string | null;
  api: string | undefined;
}

export const NetworkContext = createContext<NetworkContext>({
  chain: undefined,
  netName: undefined,
  netNames: Object.entries(NETNAMES).flatMap(([_, names]) => names),
  networkConfig: null,
  error: null,
  api: undefined,
});

const getNameName = (
  chainName: string,
  netName: string,
): NetName | undefined =>
  NETNAMES[chainName].includes(netName as NetName)
    ? (netName as NetName)
    : undefined;

export const NetworkContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { chain } = useChain();
  const search = useSearch();
  const network = useMemo(
    () => new URLSearchParams(search).get("network") ?? null,
    [search],
  );
  const [netName, setNameName] = useState<NetName | undefined>(
    network ? getNameName(chain as ChainName, network as string) : undefined,
  );
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig | null>(
    null,
  );
  const [error, setError] = useState<NetworkContext["error"]>(null);

  useEffect(() => {
    if (netName && chain) {
      getNetworkConfig(chain, netName)
        .then((value) => setNetworkConfig(value || null))
        .catch(() => {
          setNetworkConfig(null);
          setError("Failed to fetch network configuration.");
          toast.error("Failed to fetch network configuration.", {
            position: "bottom-center",
            autoClose: 3000,
          });
        });
    }
  }, [chain, netName]);

  useEffect(() => {
    const newNetName = getNameName(chain as string, network as string);
    if (newNetName !== netName) setNameName(newNetName);
  }, [network, chain, netName]);

  const netNames = useMemo(
    () => getNetworksForChain(chain as ChainName),
    [chain],
  );

  const api = useMemo(() => {
    if (netName === "local") return "http://localhost:1317";
    return networkConfig?.apiAddrs?.[0];
  }, [networkConfig, netName]);

  return (
    <NetworkContext.Provider
      value={{
        chain: chain as ChainName,
        netName: network as NetName,
        netNames,
        networkConfig,
        api,
        error,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
