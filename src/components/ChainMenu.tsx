import { useEffect, useMemo, useState } from "react";
import { capitalize } from "../utils/capitalize";
import { DropdownMenu } from "./DropdownMenu";
import { useWallet } from "../hooks/useWallet";
import { useChain } from "../hooks/useChain";
import { getChains } from "../constants/chains";

const placeholderText = "Select Chain";

const ChainMenu = () => {
  const { currentChain, setCurrentChain } = useChain();
  const { isLoading: isLoadingWallet, walletAddress } = useWallet();
  const [items, setItems] = useState<
    Array<{
      label: string;
      value: string;
      image?: string;
      onClick: () => void;
    }>
  >([]);
  const title = currentChain ? capitalize(currentChain.label) : placeholderText;
  const labelImage = useMemo(
    () => (currentChain ? currentChain.image : undefined),
    [currentChain]
  );

  useEffect(() => {
    async function fetchItems() {
      const CHAINS = await getChains();
      const newItems = CHAINS.map(({ label, value, image }) => ({
        label,
        value,
        image,
        onClick: () => {
          setCurrentChain(value);
        },
      }));
      setItems(newItems);
    }

    fetchItems();
  }, [setCurrentChain]);

  const status = useMemo(() => {
    if (isLoadingWallet) return "loading";
    if (walletAddress && currentChain) return "active";
    if (!walletAddress) return "default";
    return "error";
  }, [isLoadingWallet, walletAddress, currentChain]);

  return (
    <DropdownMenu
      title={title}
      label={placeholderText}
      labelImage={labelImage}
      items={items}
      status={status}
      showImage={true}
    />
  );
};

export { ChainMenu };
