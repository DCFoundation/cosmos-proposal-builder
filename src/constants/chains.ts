import { ChainItem } from "../types/chain";
import permittedChains from "../data/permittedChains.json";
import { getChainItem } from "../config/chainConfig";
import { toast } from "react-toastify";

async function importChainData(chainName: string) {
  try {
    const chainData = await import(`../data/chains/${chainName}.json`);
    return getChainItem({ value: chainName, ...chainData.default });
  } catch (error) {
    toast.error(`Permitted chain ${chainName} has no known configuration`);
    console.warn(`Error importing data for chain: ${chainName}`, error);
    return null;
  }
}

async function loadChains() {
  const chainPromises = permittedChains.map(importChainData);
  const chainItems = await Promise.all(chainPromises);
  return chainItems.filter((item): item is ChainItem => item !== null);
}

let CHAINS: ChainItem[] | null = null;

export async function getChains() {
  if (CHAINS === null) {
    CHAINS = await loadChains();
  }
  return CHAINS;
}
