import { useMemo } from "react";
import { capitalize } from "../utils/capitalize";
import { DropdownMenu } from "./DropdownMenu";
import { useNetwork } from "../hooks/useNetwork";
import { useWallet } from "../hooks/useWallet";
import { useChain } from "../hooks/useChain";

const placeholderText = "Select Network";

const NetworkDropdown = () => {
  const { currentNetworkName, siblingNetworkNames, setCurrentNetworkName } =
    useNetwork();

  const { currentChain } = useChain();
  const {
    isLoading: isLoadingWallet,
    stargateClient,
    walletAddress,
  } = useWallet();

  const title = currentNetworkName
    ? capitalize(currentNetworkName)
    : placeholderText;

  const items = useMemo(() => {
    if (currentChain && siblingNetworkNames) {
      return [
        ...siblingNetworkNames.map((network) => ({
          label: capitalize(network),
          value: network,
          onClick: () => {
            setCurrentNetworkName(network);
          },
        })),
      ];
    }
    return [{ label: "Loading...", value: "" }];
  }, [currentChain, siblingNetworkNames, setCurrentNetworkName]);

  console.error("current Network Name", currentNetworkName);
  const status = useMemo(() => {
    if (isLoadingWallet) return "loading";
    if (stargateClient && currentChain && currentNetworkName) return "active";
    if (!walletAddress || !currentChain) return "default";
    return "error";
  }, [
    isLoadingWallet,
    currentChain,
    stargateClient,
    walletAddress,
    currentNetworkName,
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
