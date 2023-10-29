import { ReactNode, createContext, useEffect, useMemo, useState } from "react";
import { makeAgoricChainStorageWatcher } from "@agoric/rpc";
import { getNetworkConfig } from "../lib/getNetworkConfig";
import { useSearch } from "wouter/use-location";
import qs from "query-string";

const _netNames = ["local", "devnet", "ollinet", "emerynet", "main"] as const;
export type NetName = (typeof _netNames)[number];
type Watcher = ReturnType<typeof makeAgoricChainStorageWatcher>;

interface NetworkContext {
  netName: NetName | undefined;
  netNames: NetName[];
  setNetwork: (_netName: NetName) => void;
  networkConfig: NetworkConfig | null;
  watcher: Watcher | undefined;
  error: string | null;
}

export const NetworkContext = createContext<NetworkContext>({
  netName: "local",
  netNames: Array.from(_netNames) as NetName[],
  setNetwork: () => {},
  networkConfig: null,
  watcher: undefined,
  error: null,
});

const getNameName = (netName: string): NetName =>
  _netNames.includes(netName as NetName) ? (netName as NetName) : "local";

export const NetworkContextProvider = ({
  children,
  initWatcher = false,
}: {
  children: ReactNode;
  initWatcher?: boolean;
}) => {
  const { network } = qs.parse(useSearch());
  const [netName, setNameName] = useState<NetName | undefined>(
    network ? getNameName(network as string) : undefined
  );
  const [networkConfig, setNetworkConfig] =
    useState<NetworkContext["networkConfig"]>(null);
  const [error, setError] = useState<NetworkContext["error"]>(null);

  let watcher: NetworkContext["watcher"];
  if (initWatcher && networkConfig) {
    watcher = makeAgoricChainStorageWatcher(
      networkConfig.rpc,
      networkConfig.chainName
    );
  }

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

  const setNetwork = (_netName: NetName): Promise<void> =>
    getNetworkConfig(_netName)
      .then((newNetConfig) => {
        setNetworkConfig(newNetConfig);
        setNameName(netName);
        if (initWatcher) {
          watcher = makeAgoricChainStorageWatcher(
            newNetConfig.rpc,
            newNetConfig.chainName
          );
        }
      })
      .catch(setError);

  const netNames = useMemo(() => Array.from(_netNames), []);

  return (
    <NetworkContext.Provider
      value={{
        netName,
        netNames,
        setNetwork,
        networkConfig,
        watcher,
        error,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
