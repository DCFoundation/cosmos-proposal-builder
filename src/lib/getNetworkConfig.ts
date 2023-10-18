import type { NetName } from "../contexts/network";

const getNetConfigUrl = (netName: NetName) =>
  `https://${netName}.agoric.net/network-config`;

const getNetworkConfig = async (netName: NetName): Promise<NetworkConfig> => {
  const response = await fetch(getNetConfigUrl(netName), {
    headers: { accept: "application/json" },
  });
  const networkConfig = await response.json();
  if (!networkConfig?.chainName || !networkConfig?.rpcAddrs?.[0])
    throw new Error("Error fetching network config");

  return {
    rpc: networkConfig.rpcAddrs[0],
    chainName: networkConfig.chainName,
    netName,
  };
};

export { getNetworkConfig, getNetConfigUrl };
