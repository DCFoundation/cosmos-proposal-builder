import { useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { ProposalForm, ProposalArgs } from "../../components/ProposalForm";
import { Tabs } from "../../components/Tabs";
import { useNetwork } from "../../hooks/useNetwork";
import { useWallet } from "../../hooks/useWallet";
import {
  makeCoreEvalProposalMsg,
  makeTextProposalMsg,
  makeParamChangeProposalMsg,
} from "../../lib/messageBuilder";
import { makeSignAndBroadcast } from "../../lib/signAndBroadcast";

const Inter = () => {
  const { netName } = useNetwork();
  const { walletAddress, stargateClient } = useWallet();
  const psmFormRef = useRef<HTMLFormElement>(null);
  const vaultFormRef = useRef<HTMLFormElement>(null);

  const signAndBroadcast = useMemo(
    () => makeSignAndBroadcast(stargateClient, walletAddress, netName),
    [stargateClient, walletAddress, netName],
  );

  function handleProposal(msgType: QueryParams["msgType"]) {
    return async (vals: ProposalArgs) => {
      if (!walletAddress) {
        toast.error("Wallet not connected.", { autoClose: 3000 });
        throw new Error("wallet not connected");
      }
      let proposalMsg;
      if (msgType === "coreEvalProposal") {
        if (!("evals" in vals)) throw new Error("Missing evals");
        proposalMsg = makeCoreEvalProposalMsg({
          ...vals,
          proposer: walletAddress,
        });
      }
      if (msgType === "textProposal") {
        proposalMsg = makeTextProposalMsg({
          ...vals,
          proposer: walletAddress,
        });
      }
      if (msgType === "parameterChangeProposal") {
        if (vals.msgType !== "parameterChangeProposal") return;
        proposalMsg = makeParamChangeProposalMsg({
          ...vals,
          proposer: walletAddress,
        });
      }
      if (!proposalMsg) throw new Error("Error parsing query or inputs.");

      await signAndBroadcast(proposalMsg);
      try {
        await signAndBroadcast(proposalMsg, "proposal");
        psmFormRef.current?.reset();
        vaultFormRef.current?.reset();
      } catch (e) {
        console.error(e);
      }
    };
  }

  return (
    <Tabs
      tabs={[
        {
          title: "Add PSM",
          msgType: "addPSM",
          content: (
            <ProposalForm
              ref={psmFormRef}
              handleSubmit={handleProposal("textProposal")}
              titleDescOnly={true}
              title="Add PSM"
              msgType="addPSM"
              governanceForumLink="https://community.agoric.com/tags/c/inter-protocol/5/psm"
              description={
                <>
                  The PSM (Parity Stability Module) is a smart contract that
                  mints IST in exchange for approved stablecoins at a 1-to-1
                  ratio. This form will generate a{" "}
                  <a
                    className="cursor-pointer hover:text-gray-900 underline"
                    href="https://docs.agoric.com/guides/coreeval/"
                  >
                    CoreEval
                  </a>{" "}
                  proposal that will start a new PSM instance upon successful
                  passing.
                  <br />
                  <br />
                  Learn more from the{" "}
                  <a
                    className="cursor-pointer hover:text-gray-900 underline"
                    href="https://assets.ctfassets.net/h28d7ezxdyti/7fpv0Ir6wkCxjoTY1hhDUn/b64d2be55e2fb228fdd36dfa1e106011/whitepaper.pdf"
                  >
                    Inter Whitepaper
                  </a>{" "}
                  and the{" "}
                  <a
                    className="cursor-pointer hover:text-gray-900 underline"
                    href="https://info.inter.trade/psm"
                  >
                    Inter Stats
                  </a>{" "}
                  page.
                </>
              }
            />
          ),
        },
        {
          title: "Add Vault Collateral Type",
          msgType: "addVault",
          content: (
            <ProposalForm
              ref={vaultFormRef}
              handleSubmit={handleProposal("coreEvalProposal")}
              titleDescOnly={false}
              title="Add Vault Collateral Type"
              msgType="addVault"
              governanceForumLink="https://community.agoric.com/c/inter-protocol/vaults-collateral-discussion/30"
              description={
                <>
                  Vaults allow users to mint IST by using their assets as
                  collateral. The Add Vault proposal enables a new collateral
                  type to be used for opening vaults. This form will generate a{" "}
                  <a
                    className="cursor-pointer hover:text-gray-900 underline"
                    href="https://docs.agoric.com/guides/coreeval/"
                  >
                    CoreEval
                  </a>{" "}
                  proposal that will start a new Vault Manager instance upon
                  successful passing.
                  <br />
                  <br />
                  Learn more from the{" "}
                  <a
                    className="cursor-pointer hover:text-gray-900 underline"
                    href="https://assets.ctfassets.net/h28d7ezxdyti/7fpv0Ir6wkCxjoTY1hhDUn/b64d2be55e2fb228fdd36dfa1e106011/whitepaper.pdf"
                  >
                    Inter Whitepaper
                  </a>{" "}
                  and the{" "}
                  <a
                    className="cursor-pointer hover:text-gray-900 underline"
                    href="https://info.inter.trade/vaults"
                  >
                    Inter Stats
                  </a>{" "}
                  page.
                </>
              }
            />
          ),
        },
      ]}
    />
  );
};

export { Inter };
