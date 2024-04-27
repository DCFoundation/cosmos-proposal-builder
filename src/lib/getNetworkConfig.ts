import { CosmosHubChainInfo } from "../config/cosmos/chainConstants";
import type { NetName } from "../contexts/network";

const getNetConfigUrl = (netName: NetName) =>
  `https://${netName}.agoric.net/network-config`;

const makeAgoricChainConfig = async (
  netName: NetName,
): Promise<NetworkConfig> => {
  const response = await fetch(getNetConfigUrl(netName), {
    headers: { accept: "application/json" },
  });
  const networkConfig = await response.json();
  if (!networkConfig?.chainName || !networkConfig?.rpcAddrs?.[0])
    throw new Error("Error fetching network config");

  const api = Array.isArray(networkConfig.apiAddrs)
    ? (networkConfig.apiAddrs as string[])
    : ["http://localhost:1317"];

  return {
    rpc: networkConfig.rpcAddrs[0],
    chainName: networkConfig.chainName,
    api,
    netName,
    apiAddrs: networkConfig.apiAddrs,
    denom: "ubld",
  };
};

const getNetworkConfig = async (
  chainName: string,
  netName: string,
): Promise<NetworkConfig | undefined> => {
  if (chainName === "agoric") {
    return await makeAgoricChainConfig(netName);
  } else if (chainName === "cosmos") {
    const chainConfig = CosmosHubChainInfo.find((c) => c.netName === netName);
    if (!chainConfig) {
      throw new Error("CosmosHub chain not found");
    }
    return {
      rpc: chainConfig.rpc,
      api: [chainConfig.rest],
      chainName: chainConfig.chainId,
      netName: chainConfig.netName,
      apiAddrs: [chainConfig.rest],
      denom: chainConfig.stakeCurrency.coinMinimalDenom,
    };
  }
  console.error("we failed to get network config");
};

export { getNetworkConfig, getNetConfigUrl };
