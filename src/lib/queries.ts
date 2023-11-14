import type { UseQueryOptions } from "@tanstack/react-query";
import type { SwingSetApiResponse, SwingSetParams } from "../types/swingset";
import type {
  BankBalanceResponse,
  BankBalances,
  BankSupplyResponse,
  Coin,
  BankAssetMetadataResponse,
} from "../types/bank";
import type {
  GovParamsQueryResponse,
  VotingParams,
  DepositParams,
  TallyParams,
  DistributionParams,
  StakingParams,
} from "../types/gov";

export const swingSetParamsQuery = (
  api: string | undefined
): UseQueryOptions<SwingSetParams, unknown> => ({
  queryKey: ["swingSetParams", api],
  queryFn: async (): Promise<SwingSetParams> => {
    const res = await fetch(`${api}/agoric/swingset/params`);
    const data: SwingSetApiResponse = await res.json();
    return data?.params;
  },
  enabled: !!api,
});

export const accountBalancesQuery = (
  api: string | undefined,
  address: string | null
): UseQueryOptions<BankBalances, unknown> => ({
  queryKey: ["accountBalances", api, address],
  queryFn: async (): Promise<BankBalances> => {
    // same as `/cosmos/bank/v1beta1/balances/${addr}` ?
    const res = await fetch(`${api}/bank/balances/${address}`);
    const data: BankBalanceResponse = await res.json();
    return data?.result;
  },
  enabled: !!api && !!address,
});

export const bankAssetsQuery = (
  api: string | undefined
): UseQueryOptions<Coin[], unknown> => ({
  queryKey: ["bankAssets", api],
  queryFn: async (): Promise<Coin[]> => {
    const res = await fetch(`${api}/cosmos/bank/v1beta1/supply`);
    const data: BankSupplyResponse = await res.json();
    return data?.result?.supply;
  },
  enabled: !!api,
});

// do not use, does not return values for agd
export const bankAssetsMetadataQuery = (
  api: string | undefined
): UseQueryOptions<BankAssetMetadataResponse["metadatas"], unknown> => ({
  queryKey: ["bankAssetsMetadata", api],
  queryFn: async (): Promise<BankAssetMetadataResponse["metadatas"]> => {
    const res = await fetch(`${api}/cosmos/bank/v1beta1/denoms_metadata`);
    const data: BankAssetMetadataResponse = await res.json();
    return data?.metadatas;
  },
  enabled: !!api,
});

export const votingParamsQuery = (
  api: string | undefined
): UseQueryOptions<VotingParams, unknown> => ({
  queryKey: ["votingParams", api],
  queryFn: async (): Promise<VotingParams> => {
    const res = await fetch(`${api}/cosmos/gov/v1beta1/params/voting`);
    const data: GovParamsQueryResponse = await res.json();
    return data?.voting_params;
  },
  enabled: !!api,
});

export const tallyParamsQuery = (
  api: string | undefined
): UseQueryOptions<TallyParams, unknown> => ({
  queryKey: ["tallyParams", api],
  queryFn: async (): Promise<TallyParams> => {
    const res = await fetch(`${api}/cosmos/gov/v1beta1/params/tallying`);
    const data: GovParamsQueryResponse = await res.json();
    return data?.tally_params;
  },
  enabled: !!api,
});

export const depositParamsQuery = (
  api: string | undefined
): UseQueryOptions<DepositParams, unknown> => ({
  queryKey: ["depositParams", api],
  queryFn: async (): Promise<DepositParams> => {
    const res = await fetch(`${api}/cosmos/gov/v1beta1/params/deposit`);
    const data: GovParamsQueryResponse = await res.json();
    return data?.deposit_params;
  },
  enabled: !!api,
});

export const distributionParamsQuery = (
  api: string | undefined
): UseQueryOptions<DistributionParams, unknown> => ({
  queryKey: ["distributionParams", api],
  queryFn: async (): Promise<DistributionParams> => {
    const res = await fetch(`${api}/cosmos/distribution/v1beta1/params`);
    const data: { params: DistributionParams } = await res.json();
    return data?.params;
  },
  enabled: !!api,
});

export const stakingParamsQuery = (
  api: string | undefined
): UseQueryOptions<StakingParams, unknown> => ({
  queryKey: ["stakingParams", api],
  queryFn: async (): Promise<StakingParams> => {
    const res = await fetch(`${api}/cosmos/staking/v1beta1/params`);
    const data: { params: StakingParams } = await res.json();
    return data?.params;
  },
  enabled: !!api,
});
