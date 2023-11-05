import type { UseQueryResult } from "@tanstack/react-query";
import type { SwingSetParams } from "../types/swingset";
import type { BankBalances } from "../types/bank";

export const selectStorageCost = (query: UseQueryResult<SwingSetParams, unknown>) => {
  const { isLoading, data } = query;
  if (isLoading || !data) return undefined;
  const storageByte = data?.beans_per_unit.find((x) => x.key === "storageByte");
  const feeUnit = data?.beans_per_unit.find((x) => x.key === "feeUnit");
  return storageByte && feeUnit
    ? Number(storageByte.beans) / Number(feeUnit.beans)
    : undefined;
};

export const selectBeansPerUnit = (
  query: UseQueryResult<SwingSetParams, unknown>
) => {
  const { isLoading, data } = query;
  if (isLoading || !data) return undefined;
  return data?.beans_per_unit;
};


export const selectIstBalance = (
  query: UseQueryResult<BankBalances, unknown>
) => {
  const { isLoading, data } = query;
  if (isLoading || !data) return undefined;
  const itm = (data as BankBalances).find((x) => x.denom === "uist");
  return itm ? BigInt(itm.amount) : undefined;
};

export const selectBldCoins = (
  query: UseQueryResult<BankBalances, unknown>
) => {
  const { isLoading, data } = query;
  if (isLoading || !data) return undefined;
  return (data as BankBalances).filter((x) => x.denom === "ubld");
};
