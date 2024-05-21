import { useWallet } from "../hooks/useWallet";
import { Button, ButtonProps } from "../components/Button";
import { trimAddress } from "../utils/trimAddress";
import { useMemo } from "react";
import { useNetwork } from "../hooks/useNetwork";

const WalletConnectButton = ({ theme }: { theme: ButtonProps["theme"] }) => {
  const { networkConfig } = useNetwork();
  const bech32Prefix = networkConfig?.bech32Prefix;
  const { walletAddress, stargateClient, isLoading } = useWallet();

  const buttonText = useMemo(() => {
    if (isLoading) return "Loading...";
    if (!walletAddress || !stargateClient) return "Connect Wallet";
    if (!bech32Prefix) return "Select Network";
    try {
      assert(walletAddress.startsWith(bech32Prefix), "Invalid  Address");
      return trimAddress(walletAddress);
    } catch (error) {
      console.error("Invalid wallet address:", error);
      return "Loading...";
    }
  }, [walletAddress, bech32Prefix, isLoading, stargateClient]);

  return <Button text={buttonText} theme={theme} />;
};

export { WalletConnectButton };
