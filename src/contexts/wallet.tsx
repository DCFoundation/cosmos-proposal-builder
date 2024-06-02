import { createContext, ReactNode } from 'react';
import useWalletData from '../hooks/useWalletData';
import { SigningStargateClient } from '@cosmjs/stargate';

interface WalletContextValue {
  walletAddress: string | null;
  stargateClient: SigningStargateClient | null;
  connectWallet: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const WalletContext = createContext<WalletContextValue | null>(null);

export const WalletContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { walletAddress, stargateClient, connectWallet, isLoading, error } =
    useWalletData();

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        stargateClient,
        connectWallet,
        isLoading,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
