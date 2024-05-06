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
import { makeChainInfo } from "../config/chainConfig";

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

export const WalletContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const stargateClient = useRef<SigningStargateClient | undefined>(undefined);
  const { currentChainName } = useChain();
  const { currentNetworkName, networkConfig } = useNetwork();
  const [currNetName, setCurrNetName] = useState(currentChainName); 

  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    return window.localStorage.getItem("walletAddress") || null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [chainInfo, setChainInfo] = useState<ChainInfo | null>(null);
  

  const saveAddress = useCallback(({ address }: AccountData) => {
    window.localStorage.setItem("walletAddress", address);
    setWalletAddress(address);
  }, []);

  // const handleWalletChange = useCallback(async () => {
  //   console.log("Key store in Keplr is changed. Refetching account info...");

  //   if (currentChainName && currentNetworkName && networkConfig) {
  //     try {
  //       const chainInfo = await makeChainInfo(networkConfig);
  //       if (chainInfo) {
  //         await window.keplr.enable(chainInfo.chainId);
  //         const offlineSigner = window.keplr.getOfflineSigner(
  //           chainInfo.chainId,
  //         );
  //         const accounts = await offlineSigner.getAccounts();

  //         if (accounts?.[0].address !== walletAddress) {
  //           saveAddress(accounts[0]);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error handling wallet change:", error);
  //     }
  //   }
  // }, [
  //   currentChainName,
  //   currentNetworkName,
  //   walletAddress,
  //   saveAddress,
  // ]);

  const connectWallet = useCallback(async () => {
    console.error('chain name is from wallet', currentChainName);
    if (!currentChainName || !currentNetworkName || !networkConfig) {
      console.error("Either chain or network isnt set");
      setIsLoading(false);
      return;
    }

    console.error('chain info is from wallet is ', chainInfo);

    setIsLoading(true);
    try {
      const chainInfo = await makeChainInfo(networkConfig);
      console.error('chain info is FROM WALLET', chainInfo);
      if (chainInfo) {
        setChainInfo(chainInfo);
        await window.keplr.enable(chainInfo.chainId);
        const offlineSigner = window.keplr.getOfflineSigner(chainInfo.chainId);
        const accounts = await offlineSigner.getAccounts();
        if (accounts?.[0].address !== walletAddress) {
          saveAddress(accounts[0]);
        }
        try {
          stargateClient.current =
            await SigningStargateClient.connectWithSigner(
              chainInfo.rpc,
              offlineSigner,
              {
                registry,
                gasPrice: {
                  denom: chainInfo.feeCurrencies[0].coinMinimalDenom,
                  amount: Decimal.fromUserInput("500000", 0),
                },
              },
            );
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
  }, [
    currentChainName,
    currentNetworkName,
    walletAddress,
    saveAddress,
  ]);
  if (currentChainName && currNetName !== currentChainName) {
    if (walletAddress) connectWallet();
    setCurrNetName(currentNetworkName);
  }
  // useEffect(() => {
  //   // window.addEventListener("keplr_keystorechange", handleWalletChange);

  //   return () => {
  //     window.removeEventListener("keplr_keystorechange", handleWalletChange);
  //   };
  // }, [handleWalletChange]);

  // useEffect(() => {
  //   if (currentChainName && currentNetworkName && !walletAddress) {
  //     connectWallet();
  //   }
  // }, [currentChainName, currentNetworkName, walletAddress, connectWallet]);

  useEffect(() => {
    if (!(currentNetworkName && currentChainName) && stargateClient.current) {
      stargateClient.current = undefined;
      return;
    }
    if (walletAddress && currentChainName && currentNetworkName && !stargateClient.current) {
      connectWallet();
    }
  }, [walletAddress, currentNetworkName, currentChainName, connectWallet]);
  useEffect(() => {
    if ( !(currentChainName && currentNetworkName)) {
      setWalletAddress(null);
      setChainInfo(null);
      window.localStorage.removeItem("walletAddress");
      stargateClient.current = undefined;
    }
  }, [currentChainName]); //TODO: wallet only changes upon networ/wallet switcj

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        connectWallet,
        stargateClient: stargateClient.current,
        isLoading,
        chainInfo,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
