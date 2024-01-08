import { ToastContainer } from "react-toastify";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { ChainDropdown } from "./components/ChainDropdown";
import { NetworkDropdown } from "./components/NetworkDropdown";
import { WalletConnectButton } from "./components/WalletConnectButton";
import { ChainTiles } from "./components/ChainTiles";
import { useChain } from "./hooks/useChain";

const App = () => {
  const { chain, chains } = useChain();
  return (
    <div className="flex flex-col min-h-screen">
      <Nav
        title="Cosmos Proposal Builder"
        showLogo={true}
        rightContent={
          <>
            <div className="mr-6 relative">
              <ChainDropdown />
            </div>
            <div className="mr-6 relative">
              <NetworkDropdown />
            </div>
            <WalletConnectButton theme="white" />
          </>
        }
      />
      <main className="flex-grow mx-auto max-w-7xl min-w-full py-6 sm:px-6 lg:px-8">
        {!chain ? <ChainTiles chains={chains} /> : <Agoric />}
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
