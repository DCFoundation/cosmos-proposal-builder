const bech32Config = {
  bech32PrefixAccAddr: "cosmos",
  bech32PrefixAccPub: "cosmospub",
  bech32PrefixValAddr: "cosmosvaloper",
  bech32PrefixValPub: "cosmosvaloperpub",
  bech32PrefixConsAddr: "cosmosvalcons",
  bech32PrefixConsPub: "cosmosvalconspub",
};
const stakeCurrency = {
  coinDenom: "ATOM",
  coinMinimalDenom: "uatom",
  coinDecimals: 6,
  coinGeckoId: "cosmos",
};
const feeCurrencies = [
  {
    coinDenom: "ATOM",
    coinMinimalDenom: "uatom",
    coinDecimals: 6,
    coinGeckoId: "cosmos",
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
  },
];

const currencies = [
  {
    coinDenom: "ATOM",
    coinMinimalDenom: "uatom",
    coinDecimals: 6,
    coinGeckoId: "cosmos",
  },
];

const bip44 = {
  coinType: 118,
};

const chainName = "cosmos";

export const CosmosHubChainInfo = [
  {
    chainName,
    chainId: "cosmoshub-4",
    netName: "cosmoshub-mainnet",
    rpc: "https://cosmos-rpc.publicnode.com:443",
    rest: "https://cosmos-api.w3coins.io:443",
    walletUrlForStaking: "https://wallet.keplr.app/#/cosmoshub/stake",
    bip44,
    currencies,
    feeCurrencies,
    stakeCurrency,
    bech32Config,
  },
  {
    chainName,
    chainId: "cosmoshub-devnet",
    netName: "cosmoshub-devnet",
    rest: "https://testnet-croeseid-4.crypto.org:1317",
    rpc: "https://testnet-croeseid-4.crypto.org:26657",
    stakeCurrency,
    walletUrlForStaking: "https://wallet.keplr.app/#/cosmoshub-devnet/stake",
    bip44,
    bech32Config,
    currencies,
    feeCurrencies,
  },
  {
    chainName,
    chainId: "cosmoshub-local",
    netName: "cosmoshub-local",
    rpc: "http://localhost:26657",
    rest: "http://localhost:1317",
    stakeCurrency,
    walletUrlForStaking: "http://localhost:8080/#/cosmoshub-local/stake",
    bip44,
    bech32Config,
    currencies,
    feeCurrencies,
  },
];
