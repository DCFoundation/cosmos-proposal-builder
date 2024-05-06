import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Bech32Config, ChainInfo, FeeCurrency } from "@keplr-wallet/types";
import {
  fetchAvailableChains,  
  fetchNetworksForChain,
  generateBech32Config,
  getChainNameFromLocation,
  makeCurrency,
} from "../config/chainConfig";
import { usePathname } from "wouter/use-location";


const resolvechainName = (location: string) => {
  const pathname = location.slice(1);
  const available = fetchAvailableChains().then((chains) =>
    chains.filter((chain) => chain.value === pathname)[0]?.value,
  );
  return available.catch((e) => { throw new Error('chain not recognized: ' +  e)});
}
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
  networksForCurrentChain: string[];
  // getChainInfo: (networkName: string) => Promise<ChainInfo | null>;
}

export const ChainContext = createContext<ChainContextValue>({
  currentChainName: null,
  availableChains:[],
  networksForCurrentChain: [],
  // getChainInfo: async () => null,
});
export type GaspPriceStep = {
  fixed: number;
  low: number;
  average: number;
  high: number;
};
//TODO: make sure we get exponent since all chains do have this

export const ChainContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentChainName, setCurrentChainName] = useState<string | null>(null);

  // const [location] = useLocation();
  // const [currentChainName, setCurrentChainName] = useState<string | null>(null);
  // const currentChainName = usePathname()
  const [location] = useLocation();

useEffect(() => {
  resolvechainName(location)
    .then((res) => setCurrentChainName(res))
    .catch((e) => { throw new Error('chain not recognized: ' +  e)});
}, [location]);
  if (!currentChainName) {
    console.error("no chain name found");
  }

  console.error
  // const pathName = usePathname()
  // const currentChainName = useMemo(() => pathName.split('/')[0], [pathName])
  // getChainNameFromLocation(location).then((chainName) => setCurrentChainName(chainName));
  const [availableChains, setAvailableChains] = useState<ChainListItem[]>([]);
  const [networksForCurrentChain, setNetworksForCurrentChain] = useState<
    string[]
  >([]);
  // const currentChainName = useMemo((() => location.split("/")[1]), [location]);
  // useEffect(() => {
  //   const fetchChainName = async () => {
  //     const chainName = await getChainNameFromLocation(location);
  //     setCurrentChainName(chainName);
  //   };

  //   fetchChainName();
  // }, [location]);

  useEffect(() => {
    const fetchChains = async () => {
      const chains = await fetchAvailableChains();
      setAvailableChains(chains);
    };

    fetchChains();
  }, []);

  useEffect(() => {
    const fetchNetworks = async () => {
      if (currentChainName) {
        const networks = await fetchNetworksForChain(currentChainName);
        setNetworksForCurrentChain(networks);
      //   const network = networks[0];
      // if (network) {
      //   setLocation(`/{chainName}?network=${network}`);
      // }
      } else {
        setNetworksForCurrentChain([]);
      }
    };

    fetchNetworks();
  }, [currentChainName]);


  // const [networksForCurrentChain, setNetworksForCurrentChain] = useState<
  //   string[]
  // >([]);
  // useEffect(() => {
  //   const fetchAvailableChains = async () => {
  //     const chainNames = await fetchApprovedChains();
  //     const chains = chainNames.map((chainName) => ({
  //       label: capitalize(chainName),
  //       value: chainName,
  //       href: `/${chainName}`,
  //       image: `/logo/${chainName}.svg`,
  //     }));
  //     setAvailableChains(chains);
  //   };

  //   fetchAvailableChains();
  // }, []);
  // const networksForCurrentChain = useMemo(async () => {
  //   if (currentChainName) {
  //     return await fetchNetworksForChain(currentChainName);
  //   } else {
  //     console.error("no network for current chain?  Bummer");
  //     return [];
  //   }
  // }, [currentChainName]);

  // useEffect(() => {
 
  //   const fetchChainName = async () => {
  //     const chainName = await getChainNameFromLocation(location);
  //     console.error("we compute chain name to be ", chainName);
  //     setCurrentChainName(chainName);
  //   };
  //   fetchChainName();

    // if (currentChainName) {
    //   fetchNetworksForChain(currentChainName).then(setNetworksForCurrentChain);
    // } else {
    //   console.error("no network for current chain?  Bummer");
    //   setNetworksForCurrentChain([]);
    // }
  // }, [location]);

  // useEffect(() => {
  //   if (currentChainName) {
  //     fetchNetworksForChain(currentChainName).then(setNetworksForCurrentChain);
  //   } else {
  //     console.error("no network for current chain?  Bummer");
  //     setNetworksForCurrentChain([]);
  //   }
  // }, [currentChainName])

  //todo optimize this, take all and map to makeCurrency same for rpc and rest
  //also move to suggestChain as before
  // const getChainInfo = async (
  //   networkName: string,
  // ): Promise<ChainInfo | null> => {
  //   if (!currentChainName) return null;
  //   console.error("current chain name", currentChainName);
  //   try {
  //     const fetchedConfig = await import(
  //       `../chainConfig/${currentChainName}/${networkName}/chain.json`
  //     );
  //     const bech32Config: Bech32Config = generateBech32Config(
  //       fetchedConfig.bech32Config,
  //     );
  //     const stakeCurrency = makeCurrency(
  //       fetchedConfig.staking?.stakingTokens[0].denom,
  //     );
  //     const feeCurrencies = makeCurrency(
  //       fetchedConfig.fees?.feeTokens[0].denom,
  //     );
  //     const currencies = [feeCurrencies, stakeCurrency];
  //     console.error(" fetchedConfig is ", fetchedConfig);
  //     const chainInfo: ChainInfo = {
  //       rpc: fetchedConfig.apis.rpc[0].address,
  //       rest: fetchedConfig.apis.rest[0].address,
  //       chainId: fetchedConfig.chainId,
  //       chainName: currentChainName,
  //       stakeCurrency,
  //       feeCurrencies: [feeCurrencies],
  //       bech32Config: bech32Config,
  //       bip44: fetchedConfig.bip44,
  //       currencies: currencies,
  //     };
  //     return chainInfo;
  //   } catch (error) {
  //     console.error(
  //       `Failed to fetch chain info for ${currentChainName}/${networkName}:`,
  //       error,
  //     );
  //     return null;
  //   }
  // };


  return (
    <ChainContext.Provider
      value={{
        currentChainName: currentChainName,
        availableChains: availableChains || [],
        networksForCurrentChain: networksForCurrentChain!,
        // getChainInfo,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
};
