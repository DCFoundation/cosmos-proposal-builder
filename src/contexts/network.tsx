import { ReactNode, createContext, useCallback, useMemo } from "react";
import { useChain } from "../hooks/useChain";
import { useSearch } from "wouter/use-location";
import { useLocation } from "wouter";
import { NetworkConfig } from "../types/chain";
import { useQuery } from "@tanstack/react-query";
import { Bech32Config, ChainInfo, FeeCurrency } from "@keplr-wallet/types";
import {
  generateBech32Config,
  makeCurrency,
  stableCurrency,
} from "../config/chainConfig";

export interface NetworkContextValue {
  chainNetworkNames: string[] | null;
  currentNetworkName: string | null;
  networkConfig: NetworkConfig | null;
  api: string | undefined;
  setCurrentNetworkName: (network: string) => void;
  chainInfo: ChainInfo | null;
}

export const NetworkContext = createContext<NetworkContextValue | null>(null);

export const NetworkContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { currentChain } = useChain();
  const [, setLocation] = useLocation();
  const search = useSearch();

  const selectedNetwork = useMemo(
    () => new URLSearchParams(search).get("network") ?? null,
    [search],
  );

  const networksList = useMemo(
    () => currentChain?.networks.map((n) => n.networkName) ?? null,
    [currentChain?.networks],
  );

  const networkConfig = useMemo(
    () =>
      !currentChain || !selectedNetwork
        ? null
        : currentChain.networks.find(
            (n) => n.networkName === selectedNetwork,
          ) ?? null,
    [currentChain, selectedNetwork],
  );

  const restApi = useMemo(() => {
    if (selectedNetwork === "local") return "http://localhost:1317";
    return networkConfig?.apis.rest[0].address;
  }, [networkConfig, selectedNetwork]);

  const setNetwork = useCallback(
    (network: string) => {
      if (currentChain) {
        setLocation(`/${currentChain.value}?network=${network}`);
      }
    },
    [currentChain, setLocation],
  );

  const { data: chainInfo } = useQuery({
    queryKey: ["chainInfoQuery", networkConfig],
    queryFn: async () => {
      if (!networkConfig) return null;
      let stakeCurrency: FeeCurrency | undefined = undefined;
      const {
        chainName,
        apis,
        networkName,
        chainId,
        bech32Prefix,
        fees,
        slip44,
        staking,
      } = networkConfig;
      const { rpc, rest } = apis;

      const [rpcEndpoint, restEndpoint] = await Promise.all([
        choice(rpc.map((r) => r.address)),
        choice(rest.map((r) => r.address)),
      ]);
      if (!(rpcEndpoint && restEndpoint)) {
        return null;
      }
      const bech32Config: Bech32Config = generateBech32Config(bech32Prefix);
      if (!fees) {
        throw new Error("No fees found in network config");
      }
      if (staking?.stakingTokens) {
        stakeCurrency = makeCurrency({
          minimalDenom: staking.stakingTokens[0].denom,
        });
      }

      const feeCurrencies = makeCurrency({
        minimalDenom: fees.feeTokens[0].denom,
      });
      const currencies = [feeCurrencies, stakeCurrency];
      const uniqueCurrencies = new Set(
        currencies
          .filter((currency): currency is FeeCurrency => !!currency)
          .map((currency) => JSON.stringify(currency)),
      );
      const chainInfo: ChainInfo = {
        rpc: rpcEndpoint,
        rest: restEndpoint,
        chainId,
        // chainName === "agoric" || networkName === "mainnet" ?
        chainName: `${chainName} ${networkName}`,
        stakeCurrency: stakeCurrency,
        feeCurrencies:
          chainName === "agoric" ? [stableCurrency] : [feeCurrencies],
        bech32Config: bech32Config,
        bip44: {
          coinType: slip44,
        },
        walletUrlForStaking: networkConfig.walletUrl || undefined,
        currencies: Array.from(uniqueCurrencies, (currencyString) =>
          JSON.parse(currencyString),
        ),
        features: ["stargate", "ibc-transfer"],
      };
      return chainInfo;
    },
  });

  return (
    <NetworkContext.Provider
      value={{
        chainNetworkNames: networksList,
        currentNetworkName: selectedNetwork,
        networkConfig: networkConfig,
        api: chainInfo?.rest || restApi, // TODO remove as we have it on chainInfo
        setCurrentNetworkName: setNetwork,
        chainInfo: chainInfo ?? null,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

async function choice(addresses: string[]) {
  if (!addresses.length) return null;
  const idx = Math.floor(Math.random() * addresses.length);
  const addr = addresses[idx];
  try {
    const res = await fetch(addr);
    if (![200, 501].includes(res.status)) {
      throw new Error("x");
    }
    return addr;
  } catch {
    const copy = [...addresses];
    copy.splice(idx, 1);
    return choice(copy);
  }
}
