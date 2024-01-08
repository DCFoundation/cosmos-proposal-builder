import { useContext } from "react";
import { ChainContext } from "../contexts/chain";

export type { ChainName, ChainList, ChainListItem } from "../contexts/chain";

export const useChain = () => {
  return useContext(ChainContext);
};
