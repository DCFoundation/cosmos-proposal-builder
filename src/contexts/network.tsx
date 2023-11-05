import { ReactNode, createContext, useEffect, useMemo, useState } from "react";
import { getNetworkConfig } from "../lib/getNetworkConfig";
import { useSearch } from "wouter/use-location";
import qs from "query-string";

const _netNames = ["local", "devnet", "ollinet", "emerynet", "main"] as const;
export type NetName = (typeof _netNames)[number];

interface NetworkContext {
  netName: NetName | undefined;
  netNames: NetName[];
  networkConfig: NetworkConfig | null;
  error: string | null;
  api: string | undefined;
}

export const NetworkContext = createContext<NetworkContext>({
  netName: "local",
  netNames: Array.from(_netNames) as NetName[],
  networkConfig: null,
  error: null,
  api: undefined,
});

const getNameName = (netName: string): NetName =>
  _netNames.includes(netName as NetName) ? (netName as NetName) : "local";

export const NetworkContextProvider = ({ children }: { children: ReactNode }) => {
  const { network } = qs.parse(useSearch());
  const [netName, setNameName] = useState<NetName | undefined>(
    network ? getNameName(network as string) : undefined
  );
  const [networkConfig, setNetworkConfig] =
    useState<NetworkContext["networkConfig"]>(null);
  const [error, setError] = useState<NetworkContext["error"]>(null);

  useEffect(() => {
    if (network !== netName) {
      if (!netName && network) {
        const newNetName = getNameName(network as string);
        if (newNetName !== netName) setNameName(newNetName);
      } else setNameName(undefined);
    }
  }, [network, netName]);

  useEffect(() => {
    if (netName && netName !== networkConfig?.netName)
      getNetworkConfig(netName).then(setNetworkConfig).catch(setError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [netName]);

  const netNames = useMemo(() => Array.from(_netNames), []);

  const api = useMemo(() => {
    if (netName === "local") return "http://localhost:1317";
    return networkConfig?.apiAddrs?.[0];
  }, [networkConfig, netName]);

  return (
    <NetworkContext.Provider
      value={{
        netName,
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
