import { useQueries, UseQueryResult } from "@tanstack/react-query";
import { DepositParams, VotingParams } from "../types/gov";
import { depositParamsQuery, votingParamsQuery } from "../lib/queries";
import { Coin } from "../types/bank";

export const useDepositParams = (api: string | undefined) => {
  const { minDeposit, votingPeriod } = useQueries({
    queries: [depositParamsQuery(api), votingParamsQuery(api)],
    combine: (
      results: [
        UseQueryResult<DepositParams, unknown>,
        UseQueryResult<VotingParams, unknown>,
      ],
    ): { minDeposit: Coin[] | undefined; votingPeriod: string | undefined } => {
      const [deposit, voting] = results;
      return {
        minDeposit: deposit.data?.min_deposit,
        votingPeriod: voting.data?.voting_period,
      };
    },
  });
  return { minDeposit, votingPeriod };
};
