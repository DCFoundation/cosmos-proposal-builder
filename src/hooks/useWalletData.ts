import { useCallback, useMemo } from 'react';
import { SigningStargateClient } from '@cosmjs/stargate';
import { toast } from 'react-toastify';
import { useNetwork } from './useNetwork';
import {
  connectStargateClient,
  suggestAndEnableChain,
} from '../lib/suggestAndConnectChain';
import {
  useOptimizedMutation,
  useOptimizedQuery,
} from './useCacheOptimizedQueries';

export interface WalletData {
  walletAddress: string | null;
  stargateClient: SigningStargateClient | null;
}

const useWalletData = () => {
  const {
    chainInfo,
    networkConfig,
    isLoading: isLoadingNetwork,
  } = useNetwork();

  const fetchWallet = async (): Promise<WalletData | null> => {
    if (!window.keplr) {
      toast.error(
        "We couldn't find Keplr wallet. Install the extension and reload the page"
      );
      throw new Error('Missing Keplr');
    }
    if (!chainInfo) {
      toast.error("We couldn't resolve chain info");
      throw new Error('Chain info not available');
    }

    const { chainId } = chainInfo;
    await suggestAndEnableChain(chainInfo);
    return await connectStargateClient(
      chainInfo,
      window.keplr.getOfflineSigner(chainId)
    );
  };

  const walletQuery = useOptimizedQuery<WalletData | null, Error>(
    chainInfo ? ['wallet', JSON.stringify(chainInfo)] : ['wallet'],
    fetchWallet,
    { enabled: !!chainInfo }
  );

  const connectWalletMutation = useOptimizedMutation<
    WalletData | null,
    Error,
    void
  >(fetchWallet, {
    onSuccess: () => {
      walletQuery.refetch();
    },
  });

  const connectWallet = useCallback(async () => {
    if (walletQuery.isLoading || connectWalletMutation.isPending) {
      toast.error('Wallet is still loading');
      return;
    }
    await connectWalletMutation.mutateAsync();
  }, [connectWalletMutation, walletQuery.isLoading]);

  const error = useMemo(() => {
    if (networkConfig && !chainInfo) {
      console.log('network config: ', networkConfig);
      return new Error('Connect Wallet');
    }
    return walletQuery.error ?? connectWalletMutation.error ?? null;
  }, [
    chainInfo,
    walletQuery.error,
    connectWalletMutation.error,
    networkConfig,
  ]);

  return {
    walletAddress: walletQuery.data?.walletAddress ?? null,
    stargateClient: walletQuery.data?.stargateClient ?? null,
    connectWallet,
    isLoading:
      isLoadingNetwork ||
      walletQuery.isLoading ||
      connectWalletMutation.isPending,
    error,
  };
};

export default useWalletData;
