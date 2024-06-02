import { useMemo } from 'react';
import { Button, ButtonProps } from '../components/Button';
import { trimAddress } from '../utils/trimAddress';
import { toast } from 'react-toastify';
import { useNetwork } from '../hooks/useNetwork';
import { useWallet } from '../hooks/useWallet';

const WalletConnectButton = ({ theme }: { theme: ButtonProps['theme'] }) => {
  const {
    networkConfig,
    error: networkError,
    isLoading: isLoadingNetwork,
  } = useNetwork();
  const {
    walletAddress,
    stargateClient,
    isLoading: isLoadingWallet,
    connectWallet,
    error: walletError,
  } = useWallet();

  const connectHandler = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Error refetching wallet:', err);
      toast.error('Error connecting wallet');
    }
  };

  const buttonText = useMemo(() => {
    const error = networkError || walletError;
    if (error) {
      console.error('Error connecting wallet:', error);
    }
    if (isLoadingNetwork || isLoadingWallet) return 'Loading...';
    if (!walletAddress || !stargateClient) return 'Connect Wallet';
    if (!networkConfig?.bech32Prefix) return 'Select Network';
    try {
      if (!walletAddress.startsWith(networkConfig.bech32Prefix)) {
        throw new Error('Invalid Address');
      }
      return trimAddress(walletAddress);
    } catch (error) {
      console.error('Invalid wallet address:', error);
      return 'Loading... Error';
    }
  }, [
    networkError,
    walletError,
    isLoadingNetwork,
    isLoadingWallet,
    walletAddress,
    stargateClient,
    networkConfig,
  ]);

  return <Button text={buttonText} theme={theme} onClick={connectHandler} />;
};

export { WalletConnectButton };
