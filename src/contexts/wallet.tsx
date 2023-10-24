import { createContext, useEffect, useState, useRef, ReactNode } from "react";
import { Decimal } from "@cosmjs/math";
import { SigningStargateClient } from "@cosmjs/stargate";
import { AccountData } from "@keplr-wallet/types";
import { useNetwork } from "../hooks/useNetwork";
import { suggestChain } from "../lib/suggestChain";
import { getNetConfigUrl } from "../lib/getNetworkConfig";
import { registry } from "../lib/messageBuilder";

interface WalletContext {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  stargateClient: SigningStargateClient | undefined;
  isLoading: boolean;
}

export const WalletContext = createContext<WalletContext>({
  walletAddress: null,
  connectWallet: () => Promise.resolve(undefined),
  stargateClient: undefined,
  isLoading: false,
});

export const WalletContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const stargateClient = useRef<SigningStargateClient | undefined>(undefined);
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
    const { chainId, rpc } = await suggestChain(getNetConfigUrl(netName));
    if (chainId) {
      await window.keplr.enable(chainId);
      const offlineSigner = window.keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      if (accounts?.[0].address !== walletAddress) {
        saveAddress(accounts[0]);
      }
      try {
        stargateClient.current = await SigningStargateClient.connectWithSigner(
          rpc,
          offlineSigner,
          {
            registry,
            gasPrice: {
              denom: "uist",
              amount: Decimal.fromUserInput("50000000", 0),
            },
          }
        );
      } catch (e) {
        console.error("error stargateClient setup", e);
        window.localStorage.removeItem("walletAddress");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (currNetName !== netName) {
    if (walletAddress) connectWallet();
    setCurrNetName(netName);
  }

  useEffect(() => {
    if (walletAddress && !stargateClient.current) {
      connectWallet();
    }
  }, [walletAddress, stargateClient]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        connectWallet,
        stargateClient: stargateClient.current,
        isLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
