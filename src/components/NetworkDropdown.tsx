import { useMemo } from "react";
import { useNetwork } from "../hooks/useNetwork";
import { capitalize } from "../utils/capitalize";
import { DropdownMenu } from "../components/DropdownMenu";
import { useSearch } from "wouter/use-location";
import { useWallet } from "../hooks/useWallet";
import { ChainName, useChain } from "../hooks/useChain";
import { getNetworksForChain } from "../contexts/chain";

const placeholderText = "Select Network";

const NetworkDropdown = () => {
  const searchString = useSearch();
  const { chain } = useChain();
  const { netName } = useNetwork();
  const networkEntries = useMemo(
    () => (chain ? getNetworksForChain(chain as ChainName) : []),
    [chain],
  );
  const { isLoading, stargateClient, walletAddress } = useWallet();
  const title = netName ? capitalize(netName) : placeholderText;
  const items = useMemo(
    () =>
      networkEntries.map((network) => ({
        label: capitalize(network),
        value: network,
        href: `/${chain}?${new URLSearchParams({ network }).toString()}`,
      })),
    // incl searchString and chain (pathname) to regenerate links if query params change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchString, chain, networkEntries],
  );

  const status = useMemo(() => {
    if (isLoading) return "loading";
    if (stargateClient && netName) return "active";
    if (!walletAddress || !netName) return "default";
    return "error";
  }, [isLoading, stargateClient, walletAddress, netName]);
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
