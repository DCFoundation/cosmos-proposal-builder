import agoric from "../data/chains/agoric/index.json";

import { ChainItem } from "../types/chain";
import { getChainItem } from "../config/chainConfig";

export const CHAINS: ChainItem[] = [getChainItem(agoric)];
