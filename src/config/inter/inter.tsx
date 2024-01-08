import { useRef } from "react";
import { assertIsDeliverTxSuccess, DeliverTxResponse } from "@cosmjs/stargate";
import { EncodeObject } from "@cosmjs/proto-signing";
import { createId } from "@paralleldrive/cuid2";
import { toast } from "react-toastify";
import { ProposalForm, ProposalArgs } from "../../components/ProposalForm";
import { Tabs } from "../../components/Tabs";
import { TxToastMessage } from "../../components/TxToastMessage";
import { useNetwork, NetName } from "../../hooks/useNetwork";
import { useWallet } from "../../hooks/useWallet";
import {
  makeCoreEvalProposalMsg,
  makeTextProposalMsg,
  makeFeeObject,
  makeParamChangeProposalMsg,
} from "../../lib/messageBuilder";
import { parseError } from "../../utils/transactionParser";

const Inter = () => {
  const { netName } = useNetwork();
  const { walletAddress, stargateClient } = useWallet();
  const psmFormRef = useRef<HTMLFormElement>(null);
  const vaultFormRef = useRef<HTMLFormElement>(null);

  async function signAndBroadcast(proposalMsg: EncodeObject) {
    if (!stargateClient) {
      toast.error("Network not connected.", { autoClose: 3000 });
      throw new Error("stargateClient not found");
    }
    if (!walletAddress) throw new Error("wallet not connected");
    const toastId = createId();
    toast.loading("Broadcasting transaction...", {
      toastId,
    });
    let txResult: DeliverTxResponse | undefined;
    try {
      const estimate = await stargateClient.simulate(
        walletAddress,
        [proposalMsg],
        undefined,
      );
      const adjustment = 1.3;
      const gas = Math.ceil(estimate * adjustment);
      txResult = await stargateClient.signAndBroadcast(
        walletAddress,
        [proposalMsg],
        makeFeeObject({ gas }),
      );
      assertIsDeliverTxSuccess(txResult);
    } catch (e) {
      console.error(e);
      toast.update(toastId, {
        render: parseError(e as Error),
        type: "error",
        isLoading: false,
        autoClose: 10000,
      });
    }
    if (txResult && txResult.code === 0) {
      toast.update(toastId, {
        render: ({ closeToast }) => (
          <TxToastMessage
            resp={txResult as DeliverTxResponse}
            netName={netName as NetName}
            closeToast={closeToast as () => void}
            type="proposal"
          />
        ),
        type: "success",
        isLoading: false,
      });

      psmFormRef.current?.reset();
      vaultFormRef.current?.reset();
    }
  }

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
                  ratio. This form will generate a new{" "}
                  <a
                    className="cursor-pointer hover:text-gray-900 underline"
                    href="https://docs.agoric.com/guides/coreeval/"
                  >
                    CoreEval
                  </a>{" "}
                  proposal that starts a new PSM instance.
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
                  The Add Vault proposal enables a new collateral type to be
                  used for opening Vaults. Vaults allow users to mint IST by
                  using their assets as collateral. This form will generate a
                  new{" "}
                  <a
                    className="cursor-pointer hover:text-gray-900 underline"
                    href="https://docs.agoric.com/guides/coreeval/"
                  >
                    CoreEval
                  </a>{" "}
                  proposal that starts a new Vault Manager instance.
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
