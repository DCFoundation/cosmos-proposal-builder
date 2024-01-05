import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  accountBalancesQuery,
  swingSetParamsQuery,
  bankAssetsQuery,
  bankAssetsMetadataQuery,
  votingParamsQuery,
  tallyParamsQuery,
  depositParamsQuery,
  distributionParamsQuery,
  stakingParamsQuery,
} from "./queries";
import { ReactNode } from "react";
import { renderHook } from "@testing-library/react-hooks";

interface QueryTestContext {
  api: string;
  wrapper: ({ children }: { children: ReactNode }) => ReactNode;
  addrs: { provisionPool: string };
}

beforeEach<QueryTestContext>(async (context) => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  context.wrapper = wrapper;
  context.api = "http://localhost:1317";
  context.addrs = {
    provisionPool: "agoric1megzytg65cyrgzs6fvzxgrcqvwwl7ugpt62346",
  };
});

describe("React Query Hook Tests for RPC Endpoints", () => {

  describe("swingSetParams Query", () => {
    it("should return data in a shape we're expecting", async ({
      api,
      wrapper,
    }: QueryTestContext) => {
      const { result, waitFor } = renderHook(
        () => useQuery(swingSetParamsQuery(api)),
        { wrapper }
      );

      await waitFor(() => result.current.isSuccess);
      expect(result.current.data).toBeDefined();
      expect(Object.keys(result.current.data || {})).toMatchInlineSnapshot(`
      [
        "beans_per_unit",
        "fee_unit_price",
        "bootstrap_vat_config",
        "power_flag_fees",
        "queue_max",
      ]
    `);
      expect(result.current.data).toMatchSnapshot();
    });
  });

  describe("accountBalancesQuery Query", () => {
    it("should return a uist balance > 0 for provisionPool addr", async ({
      api,
      wrapper,
      addrs,
    }: QueryTestContext) => {
      const { result, waitFor } = renderHook(
        () => useQuery(accountBalancesQuery(api, addrs.provisionPool)),
        { wrapper }
      );

      await waitFor(() => result.current.isSuccess);
      expect(result.current.data).toBeDefined();
      const istBalance = result.current.data?.find((x) => x.denom === "uist");
      expect(istBalance).toBeDefined();
      expect(Number(istBalance?.amount ?? 0)).toBeGreaterThan(1);
    });
  });

  describe("bankAssetsQuery Query", () => {
    it("should return balances for ubld, uist, and ibc/*", async ({
      api,
      wrapper,
    }: QueryTestContext) => {
      const { result, waitFor } = renderHook(
        () => useQuery(bankAssetsQuery(api)),
        { wrapper }
      );

      await waitFor(() => result.current.isSuccess);
      expect(result.current.data).toBeDefined();

      const ubld = result.current.data?.find((x) => x.denom === "ubld");
      const uist = result.current.data?.find((x) => x.denom === "uist");
      expect(Number(ubld?.amount ?? 0)).toBeGreaterThan(1);
      expect(Number(uist?.amount ?? 0)).toBeGreaterThan(1);

      const ibcTokens = result.current.data?.filter((x) =>
        x.denom.startsWith("ibc/")
      );
      expect(ibcTokens?.length).toBeGreaterThan(1);
    });
  });

  describe("bankAssetsMetadataQuery Query", () => {
    it("does not return any data for agd", async ({
      api,
      wrapper,
    }: QueryTestContext) => {
      const { result, waitFor } = renderHook(
        () => useQuery(bankAssetsMetadataQuery(api)),
        { wrapper }
      );

      await waitFor(() => result.current.isSuccess);
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toMatchInlineSnapshot("[]");
    });
  });

  describe("votingParamsQuery Query", () => {
    it("should return data in a shape we're expecting", async ({
      api,
      wrapper,
    }: QueryTestContext) => {
      const { result, waitFor } = renderHook(
        () => useQuery(votingParamsQuery(api)),
        { wrapper }
      );

      await waitFor(() => result.current.isSuccess);
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toMatchInlineSnapshot(`
        {
          "voting_period": "10s",
        }
      `);
    });
  });

  describe("tallyParamsQuery Query", () => {
    it("should return quorum, threshold, veto_threshold", async ({
      api,
      wrapper,
    }: QueryTestContext) => {
      const { result, waitFor } = renderHook(
        () => useQuery(tallyParamsQuery(api)),
        { wrapper }
      );

      await waitFor(() => result.current.isSuccess);
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toMatchInlineSnapshot(`
        {
          "quorum": "0.334000000000000000",
          "threshold": "0.500000000000000000",
          "veto_threshold": "0.334000000000000000",
        }
      `);
    });
  });

  describe("depositParamsQuery Query", () => {
    it("should return max_deposit_period, min_deposit: Coins[]", async ({
      api,
      wrapper,
    }: QueryTestContext) => {
      const { result, waitFor } = renderHook(
        () => useQuery(depositParamsQuery(api)),
        { wrapper }
      );

      await waitFor(() => result.current.isSuccess);
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toMatchInlineSnapshot(`
        {
          "max_deposit_period": "172800s",
          "min_deposit": [
            {
              "amount": "10000000",
              "denom": "ubld",
            },
          ],
        }
      `);
    });
  });

  describe("distributionParamsQuery Query", () => {
    it("should return data in a shape we're expecting", async ({
      api,
      wrapper,
    }: QueryTestContext) => {
      const { result, waitFor } = renderHook(
        () => useQuery(distributionParamsQuery(api)),
        { wrapper }
      );

      await waitFor(() => result.current.isSuccess);
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toMatchInlineSnapshot(`
        {
          "base_proposer_reward": "0.010000000000000000",
          "bonus_proposer_reward": "0.040000000000000000",
          "community_tax": "0.020000000000000000",
          "withdraw_addr_enabled": true,
        }
      `);
    });
  });

  describe("stakingParamsQuery Query", () => {
    it("should return data in a shape we're expecting", async ({
      api,
      wrapper,
    }: QueryTestContext) => {
      const { result, waitFor } = renderHook(
        () => useQuery(stakingParamsQuery(api)),
        { wrapper }
      );

      await waitFor(() => result.current.isSuccess);
      expect(result.current.data).toBeDefined();
      expect(result.current.data).toMatchInlineSnapshot(`
        {
          "bond_denom": "ubld",
          "historical_entries": 10000,
          "max_entries": 7,
          "max_validators": 100,
          "unbonding_time": "1814400s",
        }
      `);
    });
  });
});
