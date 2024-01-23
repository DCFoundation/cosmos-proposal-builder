import { useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { Code } from "../../components/inline";
import { BundleForm, BundleFormArgs } from "../../components/BundleForm";
import { ProposalForm, ProposalArgs } from "../../components/ProposalForm";
import { Tabs } from "../../components/Tabs";
import { useNetwork } from "../../hooks/useNetwork";
import { useWallet } from "../../hooks/useWallet";
import { compressBundle } from "../../lib/compression";
import {
  makeCoreEvalProposalMsg,
  makeTextProposalMsg,
  makeInstallBundleMsg,
  makeParamChangeProposalMsg,
} from "../../lib/messageBuilder";
import { isValidBundle } from "../../utils/validate";
import { makeSignAndBroadcast } from "../../lib/signAndBroadcast";
import { useWatchBundle } from "../../hooks/useWatchBundle";

const Agoric = () => {
  const { netName } = useNetwork();
  const { walletAddress, stargateClient } = useWallet();
  const proposalFormRef = useRef<HTMLFormElement>(null);
  const corEvalFormRef = useRef<HTMLFormElement>(null);
  const bundleFormRef = useRef<HTMLFormElement>(null);
  const watchBundle = useWatchBundle();

  const signAndBroadcast = useMemo(
    () => makeSignAndBroadcast(stargateClient, walletAddress, netName),
    [stargateClient, walletAddress, netName],
  );

  async function handleBundle(vals: BundleFormArgs) {
    if (!walletAddress) {
      toast.error("Wallet not connected.", { autoClose: 3000 });
      throw new Error("wallet not connected");
    }
    if (!isValidBundle(vals.bundle)) {
      toast.error("Invalid bundle format.", { autoClose: 3000 });
      throw new Error("Invalid bundle.");
    }
    const { compressedBundle, uncompressedSize } = await compressBundle(
      JSON.parse(vals.bundle),
    );
    const proposalMsg = makeInstallBundleMsg({
      compressedBundle,
      uncompressedSize,
      submitter: walletAddress,
    });
    try {
      const txResponse = await signAndBroadcast(proposalMsg, "bundle");
      if (txResponse) {
        const { endoZipBase64Sha512 } = JSON.parse(vals.bundle);
        await watchBundle(endoZipBase64Sha512, txResponse);
        bundleFormRef.current?.reset();
      }
    } catch (e) {
      console.error(e);
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

      try {
        await signAndBroadcast(proposalMsg, "proposal");
        proposalFormRef.current?.reset();
        corEvalFormRef.current?.reset();
      } catch (e) {
        console.error(e);
      }
    };
  }

  return (
    <Tabs
      tabs={[
        {
          title: "Text Proposal",
          msgType: "textProposal",
          content: (
            <ProposalForm
              ref={proposalFormRef}
              handleSubmit={handleProposal("textProposal")}
              titleDescOnly={true}
              title="Text Proposal"
              msgType="textProposal"
              governanceForumLink="https://community.agoric.com/c/governance/signaling-proposals/17"
              description={
                <>
                  This is a governance proposal that can be used for signaling
                  support or agreement on a certain topic or idea. Text
                  proposals do not contain any code, and do not directly enact
                  changes after a passing vote.
                </>
              }
            />
          ),
        },
        {
          title: "CoreEval Proposal",
          msgType: "coreEvalProposal",
          content: (
            <ProposalForm
              ref={corEvalFormRef}
              handleSubmit={handleProposal("coreEvalProposal")}
              titleDescOnly={false}
              title="CoreEval Proposal"
              msgType="coreEvalProposal"
              governanceForumLink="https://community.agoric.com/c/governance/core-eval/31"
              description={
                <>
                  This is a governance proposal that executes code after a
                  passing vote. The JSON Permit grants{" "}
                  <a
                    className="cursor-pointer hover:text-gray-900 underline"
                    href="https://docs.agoric.com/guides/coreeval/permissions.html"
                  >
                    capabilities
                  </a>{" "}
                  and the JS Script can start or update a contract. These files
                  can be generated with the <Code>agoric run</Code> command. For
                  more details, see the{" "}
                  <a
                    className="cursor-pointer hover:text-gray-900 underline"
                    href="https://docs.agoric.com/guides/coreeval/"
                  >
                    official docs
                  </a>
                  .
                </>
              }
            />
          ),
        },
        {
          title: "Install Bundle",
          msgType: "installBundle",
          content: (
            <BundleForm
              ref={bundleFormRef}
              title="Install Bundle"
              handleSubmit={handleBundle}
              description={
                <>
                  The install bundle message deploys and installs an external
                  bundle generated during the <Code>agoric run</Code> process.
                  The resulting installation can be referenced in a{" "}
                  <a
                    className="cursor-pointer hover:text-gray-900 underline"
                    href="https://docs.agoric.com/guides/coreeval/"
                  >
                    CoreEval proposal
                  </a>{" "}
                  that starts or updates a contract.
                </>
              }
            />
          ),
        },
        {
          title: "Parameter Change Proposal",
          msgType: "parameterChangeProposal",
          content: (
            <ProposalForm
              title="Parameter Change Proposal"
              handleSubmit={handleProposal("parameterChangeProposal")}
              description="This is a governance proposal to change chain configuration parameters."
              governanceForumLink="https://community.agoric.com/c/governance/parameter-changes/16"
              msgType="parameterChangeProposal"
              // XXX paramOptions should be passed in as prop
            />
          ),
        },
      ]}
    />
  );
};

export { Agoric };
