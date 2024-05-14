import { useWallet } from "../hooks/useWallet";
import { Button, ButtonProps } from "../components/Button";
import { trimAddress } from "../utils/trimAddress";
import { useMemo } from "react";
import { useNetwork } from "../hooks/useNetwork";

const WalletConnectButton = ({ theme }: { theme: ButtonProps["theme"] }) => {
  const { networkConfig } = useNetwork();
  const bech32Prefix = networkConfig?.bech32Prefix;
  const { connectWallet, walletAddress, stargateClient, isLoading } =
    useWallet();
  const connectHandler = () => {
    connectWallet()
      .then(console.log)
      .catch(console.error)
      .finally(() => console.log("Connect wallet finished"));
  };

  // console.error('walletAddress', walletAddress);
  console.error("walletAddress", walletAddress);
  const buttonText = useMemo(() => {
    if (isLoading) return "Loading...";
    if (!walletAddress || !stargateClient) return "Connect Wallet";
    if (!bech32Prefix) return "Select Network";
    try {
      assert(walletAddress.startsWith(bech32Prefix), "Invalid  Address");
      return trimAddress(walletAddress);
    } catch (error) {
      console.error("Invalid wallet address:", error);
      // toast.error("Invalid wallet address", { autoClose: 3000 });
      return "Loading...";
    }
  }, [walletAddress, bech32Prefix, isLoading, stargateClient]);

  return <Button onClick={connectHandler} text={buttonText} theme={theme} />;
};

export { WalletConnectButton };
