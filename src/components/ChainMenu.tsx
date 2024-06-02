import { useMemo } from 'react';
import { capitalize } from '../utils/capitalize';
import { DropdownMenu } from './DropdownMenu';
import { useWallet } from '../hooks/useWallet';
import { useChain } from '../hooks/useChain';
import { useNetwork } from '../hooks/useNetwork';
import { useChainRegistries } from '../hooks/useChainRegistry';
// import { useChainRegistries } from '../omit/useOldChainRegistry';

const placeholderText = 'Select Chain';

// const fetchChains = async (): Promise<ChainItem[]> => {
//   const loadedChains = await Promise.all(
//     Object.entries(CHAINS).map(async ([chainName, promise]) => {
//       const chain = await promise();
//       return { ...chain, value: chainName };
//     })
//   );
//   return loadedChains;
// };

const ChainMenu = () => {
  const { isLoading: isLoadingWallet, walletAddress } = useWallet();
  const { setCurrentChain } = useChain();
  const { currentChain } = useNetwork();

  const { data: chains = [], isLoading: isLoadingChains } =
    useChainRegistries();

  const title = currentChain ? capitalize(currentChain.value) : placeholderText;
  const labelImage = useMemo(
    () => (currentChain ? currentChain.image : undefined),
    [currentChain]
  );

  const items = useMemo(() => {
    return chains.map(({ label, value, image }) => ({
      label,
      image,
      onClick: () => {
        setCurrentChain(value);
      },
    }));
  }, [chains, setCurrentChain]);

  const status = useMemo(() => {
    if (isLoadingWallet || isLoadingChains) return 'loading';
    if (walletAddress && currentChain) return 'active';
    if (!walletAddress) return 'default';
    return 'error';
  }, [isLoadingWallet, isLoadingChains, walletAddress, currentChain]);

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
