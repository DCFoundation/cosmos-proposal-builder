import { FC, PropsWithChildren } from "react";
import { NetworkContextProvider } from "./network";
import { WalletContextProvider } from "./wallet";

const ContextProviders: FC<PropsWithChildren> = ({ children }) => (
  <NetworkContextProvider initWatcher={false}>
    <WalletContextProvider>{children}</WalletContextProvider>
  </NetworkContextProvider>
);

export { ContextProviders };
