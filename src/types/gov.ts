import type { Coin } from "./bank";

export type VotingParams = {
  voting_period: string;
};

export type DepositParams = {
  min_deposit: Coin[];
  max_deposit_period: string;
};

export type TallyParams = {
  quorum: string;
  threshold: string;
  veto_threshold: string;
};

export type GovParamsQueryResponse = {
  voting_params: VotingParams;
  deposit_params: DepositParams;
  tally_params: TallyParams;
};

export type DistributionParams = {
  community_tax: string;
  base_proposer_reward: string;
  bonus_proposer_reward: string;
  withdraw_addr_enabled: boolean;
};

export type StakingParams = {
  unbonding_time: string;
  max_validators: number;
  max_entries: number;
  historical_entries: number;
  bond_denom: string;
};
