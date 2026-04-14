import type { Coin } from "./bank";

export type VotingParams = {
  voting_period: string;
};

export type DepositParams = {
  min_deposit: Coin[];
  max_deposit_period: string;
};

export type TallyParams = {
  quorum: string; // string (dec) "0.334000000000000000"
  threshold: string; // string (dec) "0.500000000000000000"
  veto_threshold: string; // string (dec) "0.334000000000000000"
};

export type MintParams = {
  mint_denom: string;
  inflation_rate_change: string;
  inflation_max: string;
  inflation_min: string;
  goal_bonded: string;
  blocks_per_year: string;
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

export type SlashingParams = {
  max_evidence_age: string;
  signed_blocks_window: string;
  min_signed_per_window: string;
  downtime_jail_duration: string;
  slash_fraction_double_sign: string;
  slash_fraction_downtime: string;
};
