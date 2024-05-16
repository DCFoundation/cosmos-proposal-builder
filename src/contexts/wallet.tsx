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
import { AccountData } from "@keplr-wallet/types";
import { registry } from "../lib/messageBuilder";
import { toast } from "react-toastify";
import { useNetwork } from "../hooks/useNetwork";
import { useMutation } from "@tanstack/react-query";
import { suggestChain } from "../config/chainConfig";

interface WalletContextValue {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  stargateClient: SigningStargateClient | undefined;
  isLoading: boolean;
}
const WALLET_ADDRESS_KEY = "walletAddress";
export const WalletContext = createContext<WalletContextValue | null>(null);
export const WalletContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const stargateClient = useRef<SigningStargateClient | undefined>(undefined);
  const { chainInfo } = useNetwork();
  const [walletAddress, setWalletAddress] = useState<
    WalletContextValue["walletAddress"]
  >(() => {
    return window.localStorage.getItem(WALLET_ADDRESS_KEY) || null;
  });

  const saveAddress = useCallback(({ address }: AccountData) => {
    window.localStorage.setItem(WALLET_ADDRESS_KEY, address);
    setWalletAddress(address);
  }, []);

  const removeAddress = useCallback(() => {
    window.localStorage.removeItem(WALLET_ADDRESS_KEY);
    setWalletAddress(null);
  }, []);
  const connectWalletMutation = useMutation({
    mutationKey: ["connectWallet", chainInfo],
    mutationFn: async () => {
      if (!chainInfo) {
        toast.error("No chain info found", {
          position: "top-right",
          autoClose: 3000,
        });
        throw new Error("No chain info found");
      }
      const { chainId, rpc, feeCurrencies } = await suggestChain(chainInfo);
      await window.keplr.enable(chainId);

      const offlineSigner = window.keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      if (accounts?.[0].address !== walletAddress) {
        saveAddress(accounts[0]);
      }
      try {
        // signingClient
        stargateClient.current = await SigningStargateClient.connectWithSigner(
          rpc,
          offlineSigner,
          {
            registry,
            gasPrice: {
              denom: feeCurrencies[0].coinMinimalDenom,
              amount: Decimal.fromUserInput("50000000", 0),
            },
          },
        );
      } catch (error) {
        removeAddress();
        stargateClient.current = undefined;
      }
    },
  });

  useEffect(() => {
    if (chainInfo && !stargateClient.current) {
      connectWalletMutation.mutateAsync();
    }
  }, [connectWalletMutation.mutateAsync, chainInfo, stargateClient.current]);

  useEffect(() => {
    const fn = () => {
      connectWalletMutation.mutateAsync();
    };
    window.addEventListener("keplr_keystorechange", fn);
    return () => {
      window.removeEventListener("keplr_keystorechange", fn);
    };
  }, [connectWalletMutation.mutateAsync]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        connectWallet: connectWalletMutation.mutateAsync,
        stargateClient: stargateClient.current,
        isLoading: connectWalletMutation.isPending,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
