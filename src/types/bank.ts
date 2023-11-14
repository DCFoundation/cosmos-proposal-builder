export type Coin = {
  denom: "ubld" | "uist" | string;
  amount: string;
};

export type BankBalances = Coin[];

export type BankBalanceResponse = {
  height: string;
  result: BankBalances;
};

export type BankSupplyResponse = {
  pagination: {
    next_key: string;
    total: string;
  };
  height: string;
  result: {
    supply: Coin[];
  };
};

export type DenomUnit = {
  denom: string;
  exponent: number;
  aliases: string[];
};

export type BankAssetMetadataResponse = {
  pagination: {
    next_key: string;
    total: string;
  };
  height: string;
  metadatas: {
    description: string;
    denom_units: DenomUnit[];
    base: string;
    display: string;
    name: string;
    symbol: string;
  }[];
};
