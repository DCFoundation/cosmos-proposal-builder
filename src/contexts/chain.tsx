import { ReactNode, createContext, useMemo } from "react";
import { useLocation } from "wouter";
import { capitalize } from "../utils/capitalize";

const _chainNames = [
  "agoric",
  "inter",
  // "cosmos",
  // "osmosis",
] as const;
export type ChainName = (typeof _chainNames)[number];

const imageMap: Record<ChainName, string> = {
  agoric: "/assets/agoric.svg",
  inter: "/assets/inter.png",
};

export type ChainList = {
  label: string;
  value: string;
  href: string;
  image: string;
}[];
interface ChainContext {
  chain: ChainName | undefined;
  chains: ChainList;
}

const chainList = Array.from(_chainNames).map((chain) => ({
  label: capitalize(chain),
  value: chain,
  href: `/${chain}`,
  image: imageMap[chain],
})) as ChainContext["chains"];

export const ChainContext = createContext<ChainContext>({
  chain: "agoric",
  chains: chainList,
});

const getChainName = (chainName: unknown): ChainName | undefined => {
  if (!chainName || typeof chainName !== "string") return undefined;
  const pathname = chainName.slice(1);
  return _chainNames.includes(pathname as ChainName)
    ? (pathname as ChainName)
    : undefined;
};

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