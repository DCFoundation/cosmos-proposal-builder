import { ReactNode, createContext, useEffect, useMemo, useState } from "react";
import { getNetworkConfig } from "../lib/getNetworkConfig";
import { useSearch } from "wouter/use-location";
import qs from "query-string";
import { toast } from "react-toastify";
import { ChainName, getNetworksForChain } from "./chain";
import { useChain } from "../hooks/useChain";

export type NetNames = Record<string, string[]>;
export const _netNames: NetNames = {
  agoric: ["local", "devnet", "ollinet", "xnet", "emerynet", "main"] as const,
  cosmos: [
    "cosmoshub-mainnet",
    "cosmoshub-testnet",
    "cosmoshub-local",
  ] as const,
  inter: [],
}as const;

_netNames.inter = [..._netNames.agoric] as const;

export type NetName = (typeof _netNames)[keyof typeof _netNames][number];

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
  netNames: Object.entries(_netNames).flatMap(([_, netNames]) => netNames),
  networkConfig: null,
  error: null,
  api: undefined,
});

const getNameName = (
  chainName: string,
  netName: string,
): NetName | undefined =>
  _netNames[chainName].includes(netName as NetName)
    ? (netName as NetName)
    : undefined;

export const NetworkContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { chain } = useChain();

  const { network } = qs.parse(useSearch());
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
  }, [network, chain]);

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
