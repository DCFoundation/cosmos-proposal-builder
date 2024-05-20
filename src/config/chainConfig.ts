import { Bech32Config, ChainInfo, FeeCurrency } from "@keplr-wallet/types";
import { capitalize } from "../utils/capitalize";
import { renderDenom } from "../utils/coin";
import { toast } from "react-toastify";
import { ChainItem, NetworkConfig, GaspPriceStep } from "../types/chain";

export const generateBech32Config = (bech32Prefix: string): Bech32Config => ({
  bech32PrefixAccAddr: bech32Prefix,
  bech32PrefixAccPub: `${bech32Prefix}pub`,
  bech32PrefixValAddr: `${bech32Prefix}valoper`,
  bech32PrefixValPub: `${bech32Prefix}valoperpub`,
  bech32PrefixConsAddr: `${bech32Prefix}valcons`,
  bech32PrefixConsPub: `${bech32Prefix}valconspub`,
});

export interface ImageObject {
  png?: string;
  svg?: string;
}

export function getChainItem({
  value,
  ...chain
}: {
  value: string;
  enabledProposalTypes: ChainItem["enabledProposalTypes"];
  networks: ChainItem["networks"];
}) {
  return {
    label: capitalize(value),
    value,
    href: `/${value}`,
    ...chain,
  };
}
export const makeCurrency = ({
  minimalDenom,
  exponent,
  gasPriceStep,
}: {
  minimalDenom: string;
  exponent?: number;
  gasPriceStep?: GaspPriceStep;
}): FeeCurrency => {
  const feeCurrency: FeeCurrency = {
    coinDenom: renderDenom(minimalDenom),
    coinMinimalDenom: minimalDenom,
    coinDecimals: exponent || 6,
    gasPriceStep: gasPriceStep || { low: 0, average: 0, high: 0 },
  };
  return feeCurrency;
};

export const stableCurrency = makeCurrency({
  minimalDenom: "uist",
  exponent: 6,
});

//TODO: return only the rpc and rest enpoints that are live
export const makeChainInfo = (networkConfig: NetworkConfig): ChainInfo => {
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
  const restIndex = Math.floor(Math.random() * (rest ? rest.length : 1));
  const rpcIndex = Math.floor(Math.random() * (rpc ? rpc.length : 1));
  const restAddr = rest[restIndex].address;
  const rpcAddr = rpc[rpcIndex].address;
  const rpcendpoint = rpcAddr.match(/:\/\//) ? rpcAddr : `http://${rpcAddr}`;
  const restendpoint = restAddr.match(/:\/\//)
    ? restAddr
    : `http://${restAddr}`;
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
  const chainInfo: ChainInfo = {
    rpc: rpcendpoint,
    rest: restendpoint,
    chainId,
    // chainName === "agoric" || networkName === "mainnet" ?
    chainName: `${chainName} ${networkName}`,
    stakeCurrency: stakeCurrency,
    feeCurrencies: chainName === "agoric" ? [stableCurrency] : [feeCurrencies],
    bech32Config: bech32Config,
    bip44: {
      coinType: slip44,
    },
    walletUrlForStaking: networkConfig.walletUrl || undefined,
    currencies: currencies.filter(
      (currency): currency is FeeCurrency => !!currency
    ),
    features: ["stargate", "ibc-transfer"],
  };
  return chainInfo;
};

export const suggestChain = async (
  chainInfo: ChainInfo
): Promise<ChainInfo> => {
  const { keplr } = window;
  if (!keplr) {
    toast.error("Keplr not found", {
      position: "top-right",
      autoClose: 3000,
    });
    throw Error("Missing Keplr");
  }
  await keplr.experimentalSuggestChain(chainInfo);
  return chainInfo;
};
