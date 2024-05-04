import { lazy } from "react";
import type { LazyExoticComponent } from "react";
import { ChainListItem } from "../contexts/chain";
import { useChain } from "../hooks/useChain";

export type ChainName = string;

const chainConfigMap = (): Record<
  ChainName,
  LazyExoticComponent<React.FC<{}>>
> => {
  const chainMap: Record<ChainName, LazyExoticComponent<React.FC<any>>> = {};
  const { availableChains } = useChain();
  // Dynamically import chain components based on the available chains
  availableChains.forEach((chain: ChainListItem) => {
    const { value: chainName } = chain;
    chainMap[chainName] = lazy(() => import(`./${chainName}/${chainName}.tsx`));
  });

  console.log("Chain map:", chainMap);

  return chainMap;
};

export { chainConfigMap };
