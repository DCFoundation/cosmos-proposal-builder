import {
  ReactNode,
  createContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
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
  networkConfig: NetworkConfig | null;
  watcher: Watcher | undefined;
  error: string | null;
  api: string | undefined;
}

export const NetworkContext = createContext<NetworkContext>({
  netName: "local",
  netNames: Array.from(_netNames) as NetName[],
  networkConfig: null,
  watcher: undefined,
  error: null,
  api: undefined,
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
  const watcher = useRef<NetworkContext["watcher"] | undefined>(undefined);

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

  useEffect(() => {
    if (!initWatcher) return;
    if (
      (networkConfig?.chainName && !watcher.current) ||
      (networkConfig?.chainName &&
        watcher.current?.chainId !== networkConfig?.chainName)
    ) {
      watcher.current = makeAgoricChainStorageWatcher(
        networkConfig.rpc,
        networkConfig.chainName
      );
    }
  }, [networkConfig, initWatcher]);

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
        watcher: watcher.current,
        error,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
