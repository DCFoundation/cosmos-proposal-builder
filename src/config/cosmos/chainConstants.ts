
export const CosmosHubChainInfo = [{
    chainId: "cosmoshub-4",
    chainName: "cosmos",
    netName: "cosmoshub-mainnet",
    // RPC endpoint of the chain.
    rpc: "https://cosmos-rpc.publicnode.com:443",
  
    // REST endpoint of the chain.
    rest: "https://cosmos-api.w3coins.io:443",
  
    // Staking coin information
    stakeCurrency: {
      // Coin denomination to be displayed to the user.
      coinDenom: "ATOM",
      // Actual denom (i.e. uatom, uscrt) used by the blockchain.
      coinMinimalDenom: "uatom",
      // # of decimal points to convert minimal denomination to user-facing denomination.
      coinDecimals: 6,
      // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
      // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
      coinGeckoId: "cosmos",
    },
  
    walletUrlForStaking: "https://wallet.keplr.app/#/cosmoshub/stake",
  
    bip44: {
 
      coinType: 118,
    },
  
    // Bech32 configuration to show the address to user.
    bech32Config: {
      bech32PrefixAccAddr: "cosmos",
      bech32PrefixAccPub: "cosmospub",
      bech32PrefixValAddr: "cosmosvaloper",
      bech32PrefixValPub: "cosmosvaloperpub",
      bech32PrefixConsAddr: "cosmosvalcons",
      bech32PrefixConsPub: "cosmosvalconspub",
    },
  
    // List of all coin/tokens used in this chain.
    currencies: [
      {
        // Coin denomination to be displayed to the user.
        coinDenom: "ATOM",
        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
        coinMinimalDenom: "uatom",
        // # of decimal points to convert minimal denomination to user-facing denomination.
        coinDecimals: 6,
        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
        coinGeckoId: "cosmos",
      },
    ],
  
    // List of coin/tokens used as a fee token in this chain.
    feeCurrencies: [
      {
        // Coin denomination to be displayed to the user.
        coinDenom: "ATOM",
        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
        coinMinimalDenom: "uatom",
        // # of decimal points to convert minimal denomination to user-facing denomination.
        coinDecimals: 6,
        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
        coinGeckoId: "cosmos",
        // (Optional) This is used to set the fee of the transaction.
        // If this field is not provided and suggesting chain is not natively integrated, Keplr extension will set the Keplr default gas price (low: 0.01, average: 0.025, high: 0.04).
        // Currently, Keplr doesn't support dynamic calculation of the gas prices based on on-chain data.
        // Make sure that the gas prices are higher than the minimum gas prices accepted by chain validators and RPC/REST endpoint.
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
  },];
