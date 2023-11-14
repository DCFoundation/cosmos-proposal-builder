import { FC, PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NetworkContextProvider } from "./network";
import { WalletContextProvider } from "./wallet";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

const ContextProviders: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <NetworkContextProvider>
      <WalletContextProvider>{children}</WalletContextProvider>
    </NetworkContextProvider>
    <ReactQueryDevtools />
  </QueryClientProvider>
);

export { ContextProviders };
