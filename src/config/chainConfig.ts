import { Bech32Config, ChainInfo, FeeCurrency } from "@keplr-wallet/types";
import { capitalize } from "../utils/capitalize";
import { renderDenom } from "../utils/coin";
import { toast } from "react-toastify";
import { ChainItem, GaspPriceStep } from "../types/chain";

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

export const suggestChain = async (
  chainInfo: ChainInfo,
): Promise<ChainInfo> => {
  console.log(" we are on suggestChain");
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
