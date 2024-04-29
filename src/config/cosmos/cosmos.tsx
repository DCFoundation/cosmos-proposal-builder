import { useMemo } from "react";
import { Tabs } from "../../components/Tabs.tsx";
import { CommunitySpend } from "../proposalTemplates/communitySpend.tsx";
import { useNetwork } from "../../hooks/useNetwork.ts";
import { selectCoins } from "../../lib/selectors.ts";
import { coins } from "@cosmjs/stargate";
import { useQuery } from "@tanstack/react-query";
import { accountBalancesQuery } from "../../lib/queries.ts";
import { useWallet } from "../../hooks/useWallet.ts";
import { AlertBox } from "../../components/AlertBox.tsx";

const Cosmos = () => {
  const { networkConfig, api } = useNetwork();
  const { walletAddress } = useWallet();

  const accountBalances = useQuery(accountBalancesQuery(api, walletAddress));

  const coinwealth = useMemo(
    () =>
      networkConfig
        ? selectCoins(networkConfig.denom, accountBalances)
        : coins(0, "uatom"),
    [networkConfig, accountBalances],
  );

  return (
    <>
      <AlertBox coins={coinwealth && coinwealth} />
      <Tabs
        tabs={[
          {
            title: "Community Spend Proposal",
            msgType: "communityPoolSpendProposal",
            content: <CommunitySpend />,
          },
        ]}
      />
    </>
  );
};

export { Cosmos };
