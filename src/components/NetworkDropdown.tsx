import { useMemo } from "react";
import { capitalize } from "../utils/capitalize";
import { DropdownMenu } from "./DropdownMenu";
import { useSearch } from "wouter/use-location";
import { useChain } from "../hooks/useChain";
import { useNetwork } from "../hooks/useNetwork";
import { useWallet } from "../hooks/useWallet";

const placeholderText = "Select Network";

const NetworkDropdown = () => {
  const searchString = useSearch();
  const { currentChainName, networksForCurrentChain } = useChain();
  const { currentNetworkName, error: networkError } = useNetwork();
  const {
    isLoading: isLoadingWallet,
    stargateClient,
    walletAddress,
  } = useWallet();

  const title = currentNetworkName
    ? capitalize(currentNetworkName)
    : placeholderText;

  const items = useMemo(() => {
    if (networksForCurrentChain) {
      return networksForCurrentChain.map((network) => ({
        label: capitalize(network),
        value: network,
        href: `/${currentChainName}?${new URLSearchParams({
          network,
        }).toString()}`,
      }));
    }
    return [{ label: "Loading...", href: "#", value: "" }];
  }, [searchString, currentChainName, networksForCurrentChain]); // should search string be a dependency? - fix

  const status = useMemo(() => {
    if (isLoadingWallet) return "loading";
    if (stargateClient && currentNetworkName) return "active";
    if (!walletAddress || !currentNetworkName || networkError) return "error";
    return "default";
  }, [
    isLoadingWallet,
    stargateClient,
    walletAddress,
    currentNetworkName,
    networkError,
  ]);

  return (
    <DropdownMenu
      title={title}
      label={placeholderText}
      items={items}
      status={status}
    />
  );
};

export { NetworkDropdown };
