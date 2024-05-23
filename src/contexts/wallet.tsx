import { createContext, ReactNode, useEffect } from "react";
import { Decimal } from "@cosmjs/math";
import { SigningStargateClient } from "@cosmjs/stargate";
import { registry } from "../lib/messageBuilder";
import { useNetwork } from "../hooks/useNetwork";
import { useQuery } from "@tanstack/react-query";
import { suggestChain } from "../config/chainConfig";

interface WalletContextValue {
  walletAddress: string | null;
  stargateClient: SigningStargateClient | null;
  isLoading: boolean;
}

export const WalletContext = createContext<WalletContextValue | null>(null);
export const WalletContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { chainInfo } = useNetwork();

  const walletQuery = useQuery({
    queryKey: ["walletQueryData", chainInfo],
    queryFn: async () => {
      if (!chainInfo) return null;
      const { chainId, rpc, feeCurrencies } = await suggestChain(chainInfo);
      await window.keplr.enable(chainId);

      const offlineSigner = window.keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      const stargateClient = await SigningStargateClient.connectWithSigner(
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

      return {
        walletAddress: accounts[0].address ?? null,
        rpc,
        feeCurrencies,
        offlineSigner,
        stargateClient: stargateClient || null,
      };
    },
  });

  const walletQueryData = walletQuery.data;

  useEffect(() => {
    const fn = () => {
      walletQuery.refetch();
    };
    window.addEventListener("keplr_keystorechange", fn);
    return () => {
      window.removeEventListener("keplr_keystorechange", fn);
    };
  }, [walletQuery.refetch]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress: walletQueryData?.walletAddress ?? null,
        stargateClient: walletQueryData?.stargateClient ?? null,
        isLoading: walletQuery.isPending,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
