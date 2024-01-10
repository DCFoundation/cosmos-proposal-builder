import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import { Switch, Route } from "wouter";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { ChainMenu } from "./components/ChainMenu";
import { NetworkDropdown } from "./components/NetworkDropdown";
import { WalletConnectButton } from "./components/WalletConnectButton";
import { ChainTiles } from "./components/ChainTiles";
import { useChain } from "./hooks/useChain";
import { chainConfigMap } from "./config";

const App = () => {
  const { chains } = useChain();
  return (
    <div className="flex flex-col min-h-screen">
      <Nav
        title="Cosmos Proposal Builder"
        showLogo={true}
        rightContent={
          <>
            <div className="mr-6 relative">
              <ChainMenu />
            </div>
            <div className="mr-6 relative">
              <NetworkDropdown />
            </div>
            <WalletConnectButton theme="white" />
          </>
        }
      />
      <main className="flex-grow mx-auto max-w-7xl min-w-full py-6 sm:px-6 lg:px-8">
        <Switch>
          <Route path="/" component={() => <ChainTiles chains={chains} />} />
          {chains.map(({ href, value }) => {
            const LazyComponent = chainConfigMap[value];
            return (
              <Route
                key={value}
                path={href}
                component={() => (
                  <Suspense fallback={<></>}>
                    <LazyComponent />
                  </Suspense>
                )}
              />
            );
          })}
        </Switch>
      </main>
      <Footer />
      <ToastContainer
        autoClose={false}
        position="bottom-right"
        closeOnClick={false}
        closeButton={true}
        bodyClassName="text-sm font-medium text-gray-900"
      />
    </div>
  );
};

export default App;
