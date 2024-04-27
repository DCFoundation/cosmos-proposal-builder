import { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ProposalForm, ProposalArgs } from "../../components/ProposalForm.tsx";
import { Tabs } from "../../components/Tabs.tsx";
import { useNetwork } from "../../hooks/useNetwork.ts";
import { useWallet } from "../../hooks/useWallet.ts";
import { makeCommunityPoolSpendProposalMsg } from "../../lib/messageBuilder.ts";
import { makeSignAndBroadcast } from "../../lib/signAndBroadcast.tsx";
import { coinsUnit } from "../../utils/coin.ts";
import { useQuery } from "@tanstack/react-query";
import { accountBalancesQuery } from "../../lib/queries.ts";
import { selectCoins } from "../../lib/selectors.ts";
import { Coin, coin } from "@cosmjs/stargate";

const CommunitySpend = () => {
  const { netName, api, networkConfig } = useNetwork();
  const { walletAddress, stargateClient } = useWallet();
  const proposalFormRef = useRef<HTMLFormElement>(null);

  const accountBalances = useQuery(accountBalancesQuery(api, walletAddress));

  const coinwealth = useMemo(
    () =>
      networkConfig
        ? selectCoins(networkConfig.denom, accountBalances)
        : ([coin(0, "uatom").denom] as unknown as Coin[]),
    [networkConfig, accountBalances],
  );

  const signAndBroadcast = useMemo(
    () => makeSignAndBroadcast(stargateClient, walletAddress, netName),
    [stargateClient, walletAddress, netName],
  );

  const handleProposal = async (vals: ProposalArgs) => {
    if (!walletAddress) {
      toast.error("Wallet not connected.", { autoClose: 3000 });
      throw new Error("wallet not connected");
    }

    if (vals.msgType === "communityPoolSpendProposal") {
      const { spend } = vals;
      if (!spend || spend.length === 0) {
        throw new Error("No community pool spend data provided");
      }

      //TODO: denom is possibly undefined. This should be handled
      const { recipient, amount } = spend[0];
      const proposalMsg = makeCommunityPoolSpendProposalMsg({
        proposer: walletAddress,
        recipient,
        amount,
        denom: networkConfig?.denom || "uatom",
        title: vals.title,
        description: vals.description,
        deposit: vals.deposit,
      });
      try {
        await signAndBroadcast(proposalMsg, "proposal");
        proposalFormRef.current?.reset();
      } catch (e) {
        console.error(e);
        toast.error("Error submitting proposal", { autoClose: 3000 });
      }
    }
  };

  const [alertBox, setAlertBox] = useState(true);

  //TODO - Query for the minimum amount required to submit a proposal
  return (
    <>
      {(!coinwealth || coinsUnit(coinwealth) < 100) && alertBox && (
        <div
          className={
            "flex justify-center w-full max-w-7xl px-2 py-2 m-auto bg-white rounded-lg -mb-5"
          }
        >
          <div className={"basis-full"}>
            <div
              className={
                "toast text-center bg-lightblue2 p-4 text-blue font-light rounded-lg flex justify-between items-center"
              }
            >
              <div className={"basis-auto grow pr-4"}>
                You need to have{" "}
                <span className={"text-red font-black"}>
                  250 {networkConfig?.denom}
                </span>{" "}
                in your wallet to submit this action
              </div>
              <div className={"basis-auto"}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={"cursor-pointer"}
                  onClick={() => setAlertBox(false)}
                >
                  <rect width="32" height="32" rx="6" fill="white" />
                  <path
                    d="M20.5 11.5L11.5 20.5M11.5 11.5L20.5 20.5"
                    stroke="#0F3941"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
      <Tabs
        tabs={[
          {
            title: "Community Spend Proposal",
            msgType: "communityPoolSpendProposal",
            content: (
              <ProposalForm
                ref={proposalFormRef}
                handleSubmit={handleProposal}
                titleDescOnly={true}
                title="Community Spend Proposal"
                msgType="communityPoolSpendProposal"
                governanceForumLink="https://community.agoric.com/c/governance/community-fund/14"
                description={
                  <>
                    This is a governance proposal to spend funds from the
                    community pool. The proposal specifies the recipient address
                    and the amount to be spent.
                  </>
                }
                denom={networkConfig?.denom}
              />
            ),
          },
        ]}
      />
    </>
  );
};

export { CommunitySpend };
