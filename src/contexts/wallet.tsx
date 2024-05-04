import {
  createContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { Decimal } from "@cosmjs/math";
import { SigningStargateClient } from "@cosmjs/stargate";
import { AccountData, ChainInfo } from "@keplr-wallet/types";
import { registry } from "../lib/messageBuilder";
import { toast } from "react-toastify";
import { useChain } from "../hooks/useChain";
import { useNetwork } from "../hooks/useNetwork";

interface WalletContextValue {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  stargateClient: SigningStargateClient | undefined;
  isLoading: boolean;
  chainInfo: ChainInfo | null;
}

export const WalletContext = createContext<WalletContextValue>({
  walletAddress: null,
  connectWallet: () => Promise.resolve(),
  stargateClient: undefined,
  isLoading: false,
  chainInfo: null,
});


export const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const { currentChainName, getChainInfo } = useChain();
  const { currentNetworkName } = useNetwork();
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    return window.localStorage.getItem("walletAddress") || null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [chainInfo, setChainInfo] = useState<ChainInfo | null>(null);
  const stargateClientRef = useRef<SigningStargateClient | undefined>(undefined);

  const saveAddress = useCallback(({ address }: AccountData)  => {
    window.localStorage.setItem("walletAddress", address);
    setWalletAddress(address);
  }, [currentChainName]);

  const handleWalletChange = useCallback(async () => {
    console.log("Key store in Keplr is changed. Refetching account info...");

    if (currentChainName && currentNetworkName) {
      try {
        const chainInfo = await getChainInfo(currentNetworkName);
        if (chainInfo) {
          await window.keplr.enable(chainInfo.chainId);
          const offlineSigner = window.keplr.getOfflineSigner(chainInfo.chainId);
          const accounts = await offlineSigner.getAccounts();

          if (accounts?.[0].address !== walletAddress) {
            saveAddress(accounts[0]);
          }
        }
      } catch (error) {
        console.error("Error handling wallet change:", error);
      }
    }
  }, [currentChainName, currentNetworkName, getChainInfo, walletAddress, saveAddress]);


  const connectWallet = useCallback(async () => {
    if (!currentChainName || !currentNetworkName) {
      console.error('Either chain or network isnt set');
      return;
    }

    setIsLoading(true);
    try {
      const chainInfo = await getChainInfo(currentNetworkName);
      if (chainInfo) {
        setChainInfo(chainInfo);
        await window.keplr.enable(chainInfo.chainId);
        const offlineSigner = window.keplr.getOfflineSigner(chainInfo.chainId);
        const accounts = await offlineSigner.getAccounts();
        if (accounts?.[0].address !== walletAddress) {
          saveAddress(accounts[0]);
        }
        try {
          stargateClientRef.current = await SigningStargateClient.connectWithSigner(chainInfo.rpc, offlineSigner, {
            registry,
            gasPrice: {
              denom: chainInfo.feeCurrencies[0].coinMinimalDenom,
              amount: Decimal.fromUserInput("500000", 0),
            },
          });
        } catch (error) {
          console.error("Error setting up SigningStargateClient:", error);
          window.localStorage.removeItem("walletAddress");
        }
      }
    } catch (error) {
      console.error("Failed to suggest chain:", error);
      toast.error("Select network first.", {
        position: "top-right",
        autoClose: 30000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentChainName, currentNetworkName, getChainInfo, walletAddress, saveAddress]);
  useEffect(() => {
    window.addEventListener("keplr_keystorechange", handleWalletChange);

    return () => {
      window.removeEventListener("keplr_keystorechange", handleWalletChange);
    };
  }, [handleWalletChange]);

  useEffect(() => {
    if (currentChainName && currentNetworkName && !walletAddress) {
      connectWallet();
    }
  }, [currentChainName, currentNetworkName, walletAddress, connectWallet]);

  useEffect(() => {
    if (currentChainName && currentNetworkName) {
      setWalletAddress(null);
      setChainInfo(null);
      window.localStorage.removeItem("walletAddress");
      stargateClientRef.current = undefined;
    }
  }, [currentChainName]);

  return (<WalletContext.Provider
    value={{
      walletAddress,
      connectWallet,
      stargateClient: stargateClientRef.current,
      isLoading,
      chainInfo,
    }}
  >
    {children}
  </WalletContext.Provider>
);
};