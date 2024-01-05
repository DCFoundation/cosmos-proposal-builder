export type Coin = {
  denom: "ubld" | "uist" | string;
  amount: string;
};

export type BankBalances = Coin[];

export type BankBalanceResponse = {
  height: string;
  balances: BankBalances;
};

export type BankSupplyResponse = {
  pagination: {
    next_key: string;
    total: string;
  };
  supply: Coin[];
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

export type DenomTrace = {
  path: string;
  base_denom: string;
};

export type DenomTracesResponse = {
  pagination: {
    next_key: string;
    total: string;
  };
  denom_traces: DenomTrace[];
};
