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

// Gov v1 Duration type (from protobuf)
export type Duration = {
  seconds?: string;
  nanos?: number;
};

// Gov v1 Params (matches ACTUAL chain response - all parameters from real chains)
export type GovV1Params = {
  minDeposit: Coin[];
  maxDepositPeriod?: Duration;
  votingPeriod?: Duration;
  quorum: string;
  threshold: string;
  vetoThreshold: string;
  minInitialDepositRatio: string;
  min_deposit_ratio: string;
  proposal_cancel_ratio: string;
  expedited_min_deposit: Coin[];
  expedited_threshold: string;
  expedited_voting_period?: Duration;
  burnVoteQuorum: boolean;
  burnProposalDepositPrevote: boolean;
  burnVoteVeto: boolean;
};

export type GovV1ParamsQueryResponse = {
  params: GovV1Params;
};

// Form data for Gov v1 parameter changes (ALL parameters from real chains)
export type GovV1ParamFormData = {
  minDeposit: { denom: string; amount: string }[];
  maxDepositPeriod: string; // duration in seconds
  votingPeriod: string; // duration in seconds
  quorum: string;
  threshold: string;
  vetoThreshold: string;
  minInitialDepositRatio: string;
  min_deposit_ratio: string;
  proposal_cancel_ratio: string;
  expedited_min_deposit: { denom: string; amount: string }[];
  expedited_threshold: string;
  expedited_voting_period: string; // duration in seconds
  burnVoteQuorum: boolean;
  burnProposalDepositPrevote: boolean;
  burnVoteVeto: boolean;
};

// Message types for Gov v1
export type MsgUpdateGovParams = {
  authority: string;
  params: GovV1Params;
};
