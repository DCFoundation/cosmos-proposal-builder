/**
 * @file ported from @agoric/web-compoonents
 */

import { Bech32Config, FeeCurrency, ChainInfo } from "@keplr-wallet/types";
import { CosmosHubChainInfo } from "../config/cosmos/chainConstants";
import { getNetworkConfig } from "./getNetworkConfig";

export const stakeCurrency: FeeCurrency = {
  coinDenom: "BLD",
  coinMinimalDenom: "ubld",
  coinDecimals: 6,
  coinGeckoId: undefined,
  gasPriceStep: {
    low: 0,
    average: 0,
    high: 0,
  },
};

export const stableCurrency: FeeCurrency = {
  coinDenom: "IST",
  coinMinimalDenom: "uist",
  coinDecimals: 6,
  coinGeckoId: undefined,
  gasPriceStep: {
    low: 0,
    average: 0,
    high: 0,
  },
};

export const agoricBech32Config: Bech32Config = {
  bech32PrefixAccAddr: "agoric",
  bech32PrefixAccPub: "agoricpub",
  bech32PrefixValAddr: "agoricvaloper",
  bech32PrefixValPub: "agoricvaloperpub",
  bech32PrefixConsAddr: "agoricvalcons",
  bech32PrefixConsPub: "agoricvalconspub",
};

export const AGORIC_COIN_TYPE = 564;
export const COSMOS_COIN_TYPE = 118;

const makeAgoricChainInfo = async (
  networkConfig: NetworkConfig,
  caption?: string,
): Promise<ChainInfo> => {
  const walletUrlForStaking = `https://${networkConfig.chainName}.staking.agoric.app`;
  const { chainName, rpc, apiAddrs } = networkConfig;
  const rpcendpoint = rpc.match(/:\/\//) ? rpc : `http://${rpc}`;
  const index = Math.floor(Math.random() * (apiAddrs ? apiAddrs.length : 1));
  const rest = apiAddrs ? apiAddrs[index] : rpc.replace(/(:\d+)?$/, ":1317");

  if (!caption) {
    caption = `Agoric ${networkConfig.netName}`;
  }

  if (!chainName) {
    throw new Error("Missing chain name");
  }

  return {
    chainId: chainName,
    chainName: caption,
    rpc: rpcendpoint,
    rest,
    bip44: {
      coinType: AGORIC_COIN_TYPE,
    },
    bech32Config: agoricBech32Config,
    currencies: [stakeCurrency, stableCurrency],
    feeCurrencies: [stableCurrency],
    stakeCurrency,
    walletUrlForStaking,
    features: ["stargate", "ibc-transfer"],
  };
};

const makeCosmosChainInfo = async (
  networkConfig: NetworkConfig,
  caption?: string,
): Promise<ChainInfo> => {
  const walletUrlForStaking = `https://wallet.keplr.app/#/cosmoshub/stake`;
  const { chainName, rpc, apiAddrs, netName } = networkConfig;
  const rpcendpoint = rpc.match(/:\/\//) ? rpc : `http://${rpc}`;
  const index = Math.floor(Math.random() * (apiAddrs ? apiAddrs.length : 1));
  const rest = apiAddrs ? apiAddrs[index] : rpc.replace(/(:\d+)?$/, ":1317");

  if (!caption) {
    caption = `Cosmos ${networkConfig.chainName}`;
  }
  const cosmosConfig = CosmosHubChainInfo.find((c) => c.netName === netName);
  if (!cosmosConfig) {
    throw new Error("CosmosHub chain not found");
  }
  return {
    chainId: chainName,
    chainName: caption,
    rpc: rpcendpoint,
    rest,
    bip44: {
      coinType: COSMOS_COIN_TYPE,
    },
    bech32Config: cosmosConfig.bech32Config,
    currencies: cosmosConfig.currencies,
    feeCurrencies: cosmosConfig.feeCurrencies,
    stakeCurrency: cosmosConfig.stakeCurrency,
    walletUrlForStaking,
    features: ["stargate", "ibc-transfer"],
  };
};

//TODO: refactor this code.
export async function suggestChain(
  chainName: string,
  netName: string,
): Promise<ChainInfo> {
  if (!chainName) {
    throw new Error("Missing chain name");
  }

  const { keplr } = window;

  if (!keplr) {
    throw Error("Missing Keplr");
  }

  let chainInfo: ChainInfo;

  const networkConfig = await getNetworkConfig(chainName, netName);
  if (!networkConfig) {
    throw new Error("failed to fetch network configuration");
  }
  if (chainName === "agoric") {
    chainInfo = await makeAgoricChainInfo(networkConfig);
  } else if (chainName === "cosmos") {
    chainInfo = await makeCosmosChainInfo(networkConfig);
  } else {
    throw new Error("Unknown chain");
  }

  await keplr.experimentalSuggestChain(chainInfo);

  return chainInfo;
}
