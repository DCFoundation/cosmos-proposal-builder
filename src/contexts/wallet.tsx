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
import { useNetwork } from "../hooks/useNetwork";
import { suggestChain } from "../lib/suggestChain";
import { registry } from "../lib/messageBuilder";

console.error(
  " registry we have ",
  Object.entries(registry).map(([key, value]) => {
    console.error(" key ", key, " value ", value);
  }),
);

interface WalletContext {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  stargateClient: SigningStargateClient | undefined;
  isLoading: boolean;
  rpc: string | null;
}

export const WalletContext = createContext<WalletContext>({
  walletAddress: null,
  connectWallet: () => Promise.resolve(undefined),
  stargateClient: undefined,
  isLoading: false,
  rpc: null,
});

export const WalletContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const stargateClient = useRef<SigningStargateClient | undefined>(undefined);
  const { netName, chain } = useNetwork();
  if (!chain) throw new Error("Chain not found");
  const [currNetName, setCurrNetName] = useState(netName);
  const [rpc, setRpc] = useState<WalletContext["rpc"]>(() => {
    if (window.localStorage.getItem("rpc")) {
      return window.localStorage.getItem("rpc") || null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<
    WalletContext["walletAddress"]
  >(() => {
    if (window.localStorage.getItem("walletAddress")) {
      return window.localStorage.getItem("walletAddress") || null;
    }
    return null;
  });

  const saveAddress = useCallback(({ address }: AccountData) => {
    window.localStorage.setItem("walletAddress", address);
    setWalletAddress(address);
  }, []);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      const { chainId, rpc, feeCurrencies } = await suggestChain(
        chain as string,
        netName as string,
      );
      setRpc(rpc);
      if (chainId) {
        await window.keplr.enable(chainId);
        const offlineSigner = window.keplr.getOfflineSigner(chainId);
        const accounts = await offlineSigner.getAccounts();
        if (accounts?.[0].address !== walletAddress) {
          saveAddress(accounts[0]);
        }
        try {
          stargateClient.current =
            await SigningStargateClient.connectWithSigner(rpc, offlineSigner, {
              registry,
              gasPrice: {
                denom: feeCurrencies[0].coinMinimalDenom,
                amount: Decimal.fromUserInput("500000", 0),
              },
            });
        } catch (e) {
          console.error("error stargateClient setup", e);
          window.localStorage.removeItem("walletAddress");
        }
      }
    } catch (error) {
      console.error("Failed to suggest chain:", error);
    } finally {
      setIsLoading(false);
    }
  }, [chain, netName, walletAddress, saveAddress]);

  useEffect(() => {
    if (netName && currNetName !== netName) {
      if (walletAddress) connectWallet();
      setCurrNetName(netName);
    }
  }, [netName, currNetName, walletAddress, connectWallet]);

  useEffect(() => {
    if (!netName && stargateClient.current) {
      stargateClient.current = undefined;
      return;
    }
    if (walletAddress && netName && !stargateClient.current) {
      connectWallet();
    }
  }, [walletAddress, netName, connectWallet]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        connectWallet,
        stargateClient: stargateClient.current,
        isLoading,
        rpc,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
