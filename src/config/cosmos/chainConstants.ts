export const bech32Config =  {
  bech32PrefixAccAddr: "cosmos",
  bech32PrefixAccPub: "cosmospub",
  bech32PrefixValAddr: "cosmosvaloper",
  bech32PrefixValPub: "cosmosvaloperpub",
  bech32PrefixConsAddr: "cosmosvalcons",
  bech32PrefixConsPub: "cosmosvalconspub",
}
export const stakeCurrency = {
  coinDenom: "ATOM",
  coinMinimalDenom: "uatom",
  coinDecimals: 6,
  coinGeckoId: "cosmos",
}
export const feeCurrencies = [
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
]

export const currencies = [
  {
    coinDenom: "ATOM",
    coinMinimalDenom: "uatom",
    coinDecimals: 6,
    coinGeckoId: "cosmos",
  },
]

const bip44 = {
  coinType: 118,
}

export const CosmosHubChainInfo = [
  {
    chainId: "cosmoshub-4",
    chainName: "cosmos",
    netName: "cosmoshub-mainnet",
    rpc: "https://cosmos-rpc.publicnode.com:443",
    rest: "https://cosmos-api.w3coins.io:443",
    walletUrlForStaking: "https://wallet.keplr.app/#/cosmoshub/stake",
    bip44,  
    currencies,
    feeCurrencies,
  },
  {
    chainId: "cosmoshub-devnet",
    chainName: "cosmos",
    netName: "cosmoshub-devnet",
    rpc: "https://cosmos-devnet-rpc.todo.com:443",
    rest: "https://cosmos-devnet-api.todo.com:443",
    stakeCurrency,
    walletUrlForStaking: "https://wallet.keplr.app/#/cosmoshub-devnet/stake",
    bip44,
    bech32Config,
    currencies,
    feeCurrencies,
  },
  {
    chainId: "cosmoshub-local",
    chainName: "cosmos",
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