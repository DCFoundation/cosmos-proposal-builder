import type { UseQueryResult } from "@tanstack/react-query";
import type { SwingSetParams } from "../types/swingset";
import type { Coin, BankBalances, DenomTrace } from "../types/bank";
import {
  TallyParams,
  VotingParams,
  DepositParams,
  MintParams,
} from "../types/gov";
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

export const selectMintParams = (
  query: UseQueryResult<MintParams, unknown>,
) => {
  if (!query?.data) return undefined;
  const params = objectToArray(query.data);
  if (!params) return undefined;
  const keys = [
    "mint_denom",
    "inflation_min",
    "inflation_max",
    "inflation_rate_change",
    "goal_bonded",
    "blocks_per_year",
  ];
  return keys
    .map((key) => params.find((param) => param.key === key))
    .filter((param): param is { key: string; value: unknown } => !!param);
};

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
