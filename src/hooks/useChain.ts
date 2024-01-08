import { useContext } from "react";
import { ChainContext, ChainName, ChainList } from "../contexts/chain";

export type { ChainName, ChainList };
export const useChain = () => {
  return useContext(ChainContext);
};
