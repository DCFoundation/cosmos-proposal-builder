import { useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { ProposalForm, ProposalArgs } from "../../components/ProposalForm.tsx";
import { useNetwork } from "../../hooks/useNetwork.ts";
import { useWallet } from "../../hooks/useWallet.ts";
import { makeCommunityPoolSpendProposalMsg } from "../../lib/messageBuilder.ts";
import { makeSignAndBroadcast } from "../../lib/signAndBroadcast.tsx";
import { renderDenom } from "../../utils/coin.ts";

const CommunitySpend = () => {
  const { netName, networkConfig } = useNetwork();
  const { walletAddress, stargateClient } = useWallet();
  const denom = networkConfig?.denom;
  const proposalFormRef = useRef<HTMLFormElement>(null);
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

  //TODO - Query for the minimum amount required to submit a proposal
  return (
    <>
      <ProposalForm
        ref={proposalFormRef}
        handleSubmit={handleProposal}
        titleDescOnly={true}
        title="Community Spend Proposal"
        msgType="communityPoolSpendProposal"
        governanceForumLink="https://community.agoric.com/c/governance/community-fund/14"
        description={
          <>
            This governance proposal to spend funds from the community pool. The
            proposal specifies the recipient address and the amount to be spent.
          </>
        }
        denom={denom ? renderDenom(denom) : "...loading"}
      />
    </>
  );
};

export { CommunitySpend };
