import { createContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Bech32Config, ChainInfo, FeeCurrency } from "@keplr-wallet/types";
import { fetchApprovedChains, fetchNetworksForChain, generateBech32Config, getChainNameFromLocation } from "../config/chainConfig";
import { capitalize } from "../utils/capitalize";

export type ChainListItem = {
  label: string;
  value: string;
  href: string;
  image: string;
};
export interface ChainContextValue {
  currentChainName: string | null;
  availableChains: ChainListItem[];
  networksForCurrentChain: string[];
  getChainInfo: (networkName: string) => Promise<ChainInfo | null>;
}

export const ChainContext = createContext<ChainContextValue>({
  currentChainName: null,
  availableChains: [],
  networksForCurrentChain: [],
  getChainInfo: async () => null,
});
export type GaspPriceStep = {
  fixed: number;
  low: number;
  average: number;
  high: number;
}

const makeCurrency = ({minimalDenom, exponent, gasPriceStep}: {minimalDenom: string, exponent: number | null, gasPriceStep: GaspPriceStep | null}): FeeCurrency => {
    let feeCurrency: FeeCurrency = {
      coinDenom: minimalDenom,
      coinMinimalDenom: minimalDenom,
      coinDecimals: exponent || 6,
      gasPriceStep: gasPriceStep || { low: 0, average: 0, high: 0}
    }

    return feeCurrency;
}

export const ChainContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();
  const [currentChainName, setCurrentChainName] = useState<string | null>(null);
  const [availableChains, setAvailableChains] = useState<ChainListItem[]>([]);
  const [networksForCurrentChain, setNetworksForCurrentChain] = useState<string[]>([]);

  useEffect(() => {
    const fetchAvailableChains = async () => {
      const chainNames = await fetchApprovedChains();
      const chains = chainNames.map((chainName) => ({
        label: capitalize(chainName),
        value: chainName,
        href: `/${chainName}`,
        image: `/logo/${chainName}.svg`,
      }));
      setAvailableChains(chains);
    };

    fetchAvailableChains();
  }, []);

  useEffect(() => {
    const fetchChainName = async () => {
      const chainName = await getChainNameFromLocation(location);
      setCurrentChainName(chainName);
    };

    fetchChainName();

    if (currentChainName) {
      fetchNetworksForChain(currentChainName).then(setNetworksForCurrentChain);
    } else {
      setNetworksForCurrentChain([]);
    }
  }, [location]);

  //todo optimize this, take all and map to makeCurrency same for rpc and rest
  const getChainInfo = async (networkName: string): Promise<ChainInfo | null> => {
    if (!currentChainName) return null;
    console.error('current chain name', currentChainName);
    try {
      const fetchedConfig = await import(`../chainConfig/${currentChainName}/${networkName}/chain.json`);
      const bech32Config: Bech32Config = generateBech32Config(fetchedConfig.bech32Config);
      const stakeCurrency = makeCurrency(fetchedConfig.staking?.stakingTokens[0].denom);
    const feeCurrencies = makeCurrency(fetchedConfig.fees?.feeTokens[0].denom);
      const currencies = [feeCurrencies, stakeCurrency];
      console.error(' fetchedConfig is ', fetchedConfig);
      const chainInfo: ChainInfo = {
        rpc: fetchedConfig.apis.rpc[0].address,
        rest: fetchedConfig.apis.rest[0].address,
        chainId: fetchedConfig.chainId,
        chainName: currentChainName,
        stakeCurrency,
        feeCurrencies: [feeCurrencies],
        bech32Config: bech32Config,
        bip44: fetchedConfig.bip44,
        currencies: currencies
      };
      return chainInfo;
    } catch (error) {
      console.error(`Failed to fetch chain info for ${currentChainName}/${networkName}:`, error);
      return null;
    }
  };

  return (
    <ChainContext.Provider
      value={{
        currentChainName,
        availableChains,
        networksForCurrentChain,
        getChainInfo,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
};

