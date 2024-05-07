import { createContext } from "react";
import { useLocation } from "wouter";
import { fetchAvailableChains } from "../config/chainConfig";

// const resolvechainName = (location: string) => {
//   const pathname = location.slice(1);
//   const available = fetchAvailableChains().then(
//     (chains) => chains.filter((chain) => chain.value === pathname)[0]?.value
//   );
//   return available;
// };
//TODO useInfiniteQuery for this
//https://tanstack.com/query/v4/docs/framework/react/reference/useInfiniteQuery
export type ChainListItem = {
  label: string;
  value: string;
  href: string;
  image: string;
};
export interface ChainContextValue {
  currentChainName: string | null;
  availableChains: ChainListItem[];
}
const chainList: ChainListItem[] =
  (await fetchAvailableChains()) as ChainContextValue["availableChains"];

export const ChainContext = createContext<ChainContextValue>({
  currentChainName: null,
  availableChains: chainList,
});

export const ChainContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [location] = useLocation();

  const chainName = location.split("/")[1];

  return (
    <ChainContext.Provider
      value={{
        currentChainName: chainName,
        availableChains: chainList,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
};
