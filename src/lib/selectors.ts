import type { UseQueryResult } from "@tanstack/react-query";
import type { SwingSetParams } from "../types/swingset";
import type { Coin, BankBalances, DenomTrace } from "../types/bank";
import { TallyParams, VotingParams, DepositParams, GovV1Params, GovV1ParamFormData, Duration } from "../types/gov";
import { objectToArray } from "../utils/object";

export type SelectorFn<T, R> = (
  query: UseQueryResult<T, unknown>,
) => R | undefined;

export const selectStorageCost = (
  query: UseQueryResult<SwingSetParams, unknown>,
): [amount: number, denom: string] | undefined => {
  const { isLoading, data } = query;
  if (isLoading || !data) return undefined;
  const feeUnit = data.fee_unit_price?.[0] as Coin | undefined;
  const beansPerFeeUnit = data.beans_per_unit.find((x) => x.key === "feeUnit");
  const beansPerByte = data.beans_per_unit.find((x) => x.key === "storageByte");
  if (!feeUnit || !beansPerFeeUnit || !beansPerByte) return undefined;
  const feeUnitsPerByte =
    Number(beansPerByte.beans) / Number(beansPerFeeUnit.beans);
  return [feeUnitsPerByte * Number(feeUnit.amount), feeUnit.denom];
};

export const selectBeansPerUnit = (
  query: UseQueryResult<SwingSetParams, unknown>,
) => {
  if (!query?.data) return undefined;
  return query.data?.beans_per_unit;
};

export const selectCoinBalance = (
  query: UseQueryResult<BankBalances, unknown>,
  denom: string,
) => {
  if (!query?.data) return undefined;
  const coin = (query.data as BankBalances).find((x) => x.denom === denom);
  return coin;
};

export const selectVotingParams = (
  query: UseQueryResult<VotingParams, unknown>,
) => {
  if (!query?.data) return undefined;
  return objectToArray(query.data);
};

export const selectTallyParams = (
  query: UseQueryResult<TallyParams, unknown>,
) => {
  if (!query?.data) return undefined;
  return objectToArray(query.data);
};

export const selectDepsoitParams = (
  query: UseQueryResult<DepositParams, unknown>,
) => {
  if (!query?.data) return undefined;
  return objectToArray(query.data);
};

// Remove duplicate - will use the one at the end

/** filter bank assets, so only ibc/* assets are returned */
export const selectIbcAssets = (
  query: UseQueryResult<BankBalances, unknown>,
) => {
  if (!query?.data) return undefined;
  return (query.data as BankBalances).filter((x) => x.denom.startsWith("ibc"));
};

export const selectSinglePathDenomTraces = (
  query: UseQueryResult<DenomTrace[], unknown>,
) => {
  if (!query?.data) return undefined;
  function hasOnePath(trace: DenomTrace): boolean {
    const matches = trace.path.match(/channel/g);
    return !matches || matches.length === 1;
  }
  return query.data.filter(hasOnePath);
};

// Helper function to convert Duration to seconds string
const durationToSeconds = (duration?: Duration): string => {
  if (!duration?.seconds) return "0";
  return duration.seconds.toString();
};

// Selector for Gov v1 parameters - converts API response to form data (ALL parameters from real chains)
export const selectGovV1Params = (
  query: UseQueryResult<GovV1Params, unknown>,
): GovV1ParamFormData | undefined => {
  if (!query?.data) return undefined;
  
  const params = query.data;
  
  // Use actual values from API, no arbitrary defaults - include ALL parameters that real chains return
  return {
    minDeposit: params.minDeposit,
    maxDepositPeriod: durationToSeconds(params.maxDepositPeriod),
    votingPeriod: durationToSeconds(params.votingPeriod),
    quorum: params.quorum,
    threshold: params.threshold,
    vetoThreshold: params.vetoThreshold,  // Fix: use correct field
    minInitialDepositRatio: params.minInitialDepositRatio,  // Fix: use correct field
    min_deposit_ratio: params.min_deposit_ratio,
    proposal_cancel_ratio: params.proposal_cancel_ratio,
    expedited_min_deposit: params.expedited_min_deposit,
    expedited_threshold: params.expedited_threshold,
    expedited_voting_period: durationToSeconds(params.expedited_voting_period),
    burnVoteQuorum: params.burnVoteQuorum,
    burnProposalDepositPrevote: params.burnProposalDepositPrevote,
    burnVoteVeto: params.burnVoteVeto,
  };
};
