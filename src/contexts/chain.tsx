import { ReactNode, createContext, useMemo } from "react";
import { useLocation } from "wouter";
import { capitalize } from "../utils/capitalize";
import { NETNAMES } from "./network";

/** "chains" can be apps or chains */
const _chainNames = ["agoric", "inter", "cosmos"] as const;
export type ChainName = (typeof _chainNames)[number];

const imageMap: Record<ChainName, string> = {
  agoric: "/assets/agoric.svg",
  inter: "/assets/inter.svg",
  cosmos: "/assets/cosmos-hub.svg",
};

export type ChainListItem = {
  label: string;
  value: ChainName;
  href: string;
  image: string;
};

export type ChainList = ChainListItem[];

export interface IChainContext {
  chain: ChainName | undefined;
  chains: ChainList;
}
const chainList = Array.from(_chainNames).map((chain) => ({
  label: capitalize(chain),
  value: chain,
  href: `/${chain}`,
  image: imageMap[chain],
})) as IChainContext["chains"];

export const ChainContext = createContext<IChainContext>({
  chain: undefined,
  chains: chainList,
});

const getChainName = (chainName: string): ChainName | undefined => {
  if (!chainName) return undefined;
  const pathname = chainName.slice(1);
  return _chainNames.includes(pathname as ChainName)
    ? (pathname as ChainName)
    : _chainNames[0];
};
export function getNetworksForChain(
  chain: ChainName,
): (typeof NETNAMES)[ChainName] {
  const networkEntry = Object.entries(NETNAMES).find(([key]) => key === chain);

  if (!networkEntry) {
    console.error(`No network entries found for chain: ${chain}`);
    return [] as unknown as (typeof NETNAMES)[ChainName];
  }
  const [_, networkEntries] = networkEntry;

  return networkEntries;
}

export const ChainContextProvider = ({ children }: { children: ReactNode }) => {
  const [location] = useLocation();
  const _chain = useMemo(() => getChainName(location), [location]);

  return (
    <ChainContext.Provider
      value={{
        chain: _chain,
        chains: chainList,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
};
