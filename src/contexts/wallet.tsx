import { createContext, useState, ReactNode } from "react";
import { AccountData } from "@keplr-wallet/types";
import { useNetwork } from "../hooks/useNetwork";
import { suggestChain } from "../lib/suggestChain";
import { getNetConfigUrl } from "../lib/getNetworkConfig";

interface WalletContext {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  isLoading: boolean;
}

export const WalletContext = createContext<WalletContext>({
  walletAddress: null,
  connectWallet: () => Promise.resolve(undefined),
  isLoading: false,
});

export const WalletContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { netName } = useNetwork();
  const [currNetName, setCurrNetName] = useState(netName);
  const [walletAddress, setWalletAddress] = useState<
    WalletContext["walletAddress"]
  >(() => {
    if (window.localStorage.getItem("walletAddress")) {
      return window.localStorage.getItem("walletAddress") || null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const saveAddress = ({ address }: AccountData) => {
    window.localStorage.setItem("walletAddress", address);
    setWalletAddress(address);
  };

  const connectWallet = async () => {
    setIsLoading(true);
    const { chainId } = await suggestChain(getNetConfigUrl(netName));
    if (chainId) {
      await window.keplr.enable(chainId);
      const offlineSigner = window.keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      if (accounts?.[0].address !== walletAddress) {
        saveAddress(accounts[0]);
      }
      setIsLoading(false);
    }
  };

  if (currNetName !== netName) {
    if (walletAddress) connectWallet();
    setCurrNetName(netName);
  }

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        connectWallet,
        isLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
