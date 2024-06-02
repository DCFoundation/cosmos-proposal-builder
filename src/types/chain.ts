export type ChainItem = {
  label: string;
  value: string;
  href: string;
  parent?: string;
  image?: string;
  // suggestEndpoints?: string;
  enabledProposalTypes: {
    textProposal?: boolean;
    parameterChangeProposal?: boolean;
    communityPoolSpendProposal?: boolean;
    softwareUpgradeProposal?: boolean;
    installBundle?: boolean;
    addPSM?: boolean;
    addVault?: boolean;
    coreEvalProposal?: boolean;
  };
  networks?: NetworkConfig[]; // only chains with a parent can have networks empty network
};

export interface NetworkConfig {
  suggestEndpoints?: string;
  chainName: string;
  chainId: string;
  networkName: string;
  slip44: number;
  fees: FeeEntry;
  bech32Prefix: string;
  apis?: Apis;
  staking?: StakeCurrencyEntry;
  explorers?: ExplorerEntry[];
  walletUrl?: string;
}

export interface StakeCurrencyEntry {
  stakingTokens: FeeToken[];
}
export interface FeeToken {
  denom: string;
  fixedMinGasPrice?: number;
  lowGasPrice?: number;
  averageGasPrice?: number;
  highGasPrice?: number;
}

export interface FeeEntry {
  feeTokens: FeeToken[];
  gasPriceStep?: GaspPriceStep;
}

export type GaspPriceStep = {
  fixed: number;
  low: number;
  average: number;
  high: number;
};

export interface ExplorerEntry {
  name?: string;
  url: string;
  txPage?: string;
  accountPage?: string;
}

export interface ApiEntry {
  address: string;
  provider?: string;
}

export interface Apis {
  rpc: ApiEntry[];
  rest: ApiEntry[];
  grpc?: ApiEntry[];
}
