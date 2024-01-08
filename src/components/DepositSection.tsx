import React, { useMemo, useRef } from "react";
import { UseQueryResult, useQueries, useQuery } from "@tanstack/react-query";
import { useNetwork } from "../hooks/useNetwork";
import { useWallet } from "../hooks/useWallet";
import {
  accountBalancesQuery,
  depositParamsQuery,
  votingParamsQuery,
} from "../lib/queries";
import type { DepositParams, VotingParams } from "../types/gov";
import { selectBldCoins } from "../lib/selectors";
import { renderCoins, coinsUnit } from "../utils/coin";

export const DepositSection: React.FC<unknown> = () => {
  const { api } = useNetwork();
  const { walletAddress } = useWallet();
  const depositRef = useRef<HTMLInputElement>(null);

  const { minDeposit, votingPeriod } = useQueries({
    queries: [depositParamsQuery(api), votingParamsQuery(api)],
    combine: (
      results: [
        UseQueryResult<DepositParams, unknown>,
        UseQueryResult<VotingParams, unknown>,
      ],
    ) => {
      const [deposit, voting] = results;
      return {
        minDeposit: deposit.data?.min_deposit,
        votingPeriod: voting.data?.voting_period,
      };
    },
  });

  const accountBalances = useQuery(accountBalancesQuery(api, walletAddress));
  const bldCoins = useMemo(
    () => selectBldCoins(accountBalances),
    [accountBalances],
  );

  return (
    <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
      <label
        htmlFor="description"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        Deposit
      </label>
      <div className="mt-2 sm:col-span-3 sm:mt-0">
        <input
          type="number"
          min="0"
          step="1" // ensures integer
          name="deposit"
          id="deposit"
          ref={depositRef}
          defaultValue={minDeposit ? coinsUnit(minDeposit) : ""}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-sm sm:text-sm sm:leading-6"
        />
        <p className="mt-3 text-sm leading-6 text-gray-600">
          <span>
            A proposal requires{" "}
            <span className="font-semibold">
              {minDeposit ? renderCoins(minDeposit) : "Unavailable"}
            </span>{" "}
            to enter voting period.
          </span>
          <br />
          <span>
            Current balance:{" "}
            <span className="font-semibold">
              {bldCoins ? renderCoins(bldCoins) : "Unavailable"}
            </span>
          </span>
          <br />
          <span>
            Voting Period:{" "}
            <span className="font-semibold">
              {votingPeriod || "Unavailable"}
            </span>
          </span>
        </p>
      </div>
    </div>
  );
};
