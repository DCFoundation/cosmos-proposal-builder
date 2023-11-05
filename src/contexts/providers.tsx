import { FC, PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NetworkContextProvider } from "./network";
import { WalletContextProvider } from "./wallet";
const queryClient = new QueryClient();

const ContextProviders: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <NetworkContextProvider>
      <WalletContextProvider>{children}</WalletContextProvider>
    </NetworkContextProvider>
  </QueryClientProvider>
);

export { ContextProviders };
