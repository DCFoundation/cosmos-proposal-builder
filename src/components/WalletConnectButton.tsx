import { useWallet } from "../hooks/useWallet";
import { Button, ButtonProps } from "../components/Button";
import { trimAddress } from "../utils/trimAddress";
import { useMemo } from "react";

const WalletConnectButton = ({ theme }: { theme: ButtonProps["theme"] }) => {
  const { connectWallet, walletAddress } = useWallet();
  const connectHandler = () => {
    connectWallet()
      .then(console.log)
      .catch(console.error)
      .finally(() => console.log("connect wallet finished"));
  };
  console.log("walletAddress", walletAddress);

  const buttonText = useMemo(() => {
    if (!walletAddress) return "Connect Wallet";
    try {
      return trimAddress(walletAddress);
    } catch (error) {
      console.error("Invalid wallet address:", error);
      return "Invalid Address";
    }
  }, [walletAddress]);

  return <Button onClick={connectHandler} text={buttonText} theme={theme} />;
};
export { WalletConnectButton };
