import { ReactNode, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useQueries, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useNetwork } from "../hooks/useNetwork";
import { useWallet } from "../hooks/useWallet";
import { useWatchBundle } from "../hooks/useWatchBundle";
import { accountBalancesQuery, depositParamsQuery, votingParamsQuery } from "../lib/queries";
import { selectCoins } from "../lib/selectors";
import { makeSignAndBroadcast } from "../lib/signAndBroadcast";
import { ProposalArgs, ProposalForm } from "../components/ProposalForm";
import { BundleForm, BundleFormArgs } from "../components/BundleForm";
import { Code } from "../components/inline";
import { CommunitySpend } from "./proposalTemplates/communitySpend";
import { FundCommunityPool } from "./proposalTemplates/fundCommunityPool";
import { AlertBox } from "../components/AlertBox";
import { Tabs } from "../components/Tabs";
import {
  makeCoreEvalProposalMsg,
  makeFundCommunityPool,
  makeInstallBundleMsg,
  makeParamChangeProposalMsg,
  makeTextProposalMsg,
} from "../lib/messageBuilder";
import { isValidBundle } from "../utils/validate";
import { compressBundle } from "../lib/compression";
import { DepositParams, VotingParams } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { coinsUnit, renderCoins } from "../utils/coin";

const ProposalsLandingPage = () => {
  const { currentNetworkName } = useNetwork();
  const { walletAddress, chainInfo, stargateClient } = useWallet();
  const denom = chainInfo?.feeCurrencies[0].coinDenom || "ubld"; //Todo fix this maybe throw error
  const { api } = useNetwork();
  const proposalFormRef = useRef<HTMLFormElement>(null);
  const corEvalFormRef = useRef<HTMLFormElement>(null);
  const bundleFormRef = useRef<HTMLFormElement>(null);
  const watchBundle = useWatchBundle(chainInfo?.rpc, {
    clipboard: window.navigator.clipboard,
  });

  const accountBalances = useQuery(accountBalancesQuery(api, walletAddress));
  const coinwealth = useMemo(
    () => selectCoins(denom, accountBalances),
    [accountBalances, denom],
  );
  const signAndBroadcast = useMemo(
    () =>
      makeSignAndBroadcast(stargateClient, walletAddress, currentNetworkName!),
    [stargateClient, walletAddress, currentNetworkName],
  );

  //   const enabledProposals = useMemo(async () => {
  //     if (!currentChainName) return [];
  //     const enabledProposalsModule = await import(`../../chainConfig/${currentChainName}/enabled.json`);
  //     return enabledProposalsModule.default;
  //   }, [currentChainName]);

  // const enabledProposals = ['textProposal', 'parameterChangeProposal', 'fundCommunityPool', 'communityPoolSpendProposal'];
  /***
   * TODO: This should come from a json config like everything else
   */
  const enabledProposals = [
    "textProposal",
    "parameterChangeProposal",
    "fundCommunityPool",
    "communityPoolSpendProposal",
  ] as QueryParams["msgType"][];

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
          denom,
        });
      }
      if (msgType === "textProposal") {
        proposalMsg = makeTextProposalMsg({
          ...vals,
          proposer: walletAddress,
          denom,
        });
      }
      if (msgType === "parameterChangeProposal") {
        if (vals.msgType !== "parameterChangeProposal") return;
        proposalMsg = makeParamChangeProposalMsg({
          ...vals,
          proposer: walletAddress,
          denom,
        });
      }
      if (msgType === "fundCommunityPool") {
        if (!("fundAmount" in vals)) throw new Error("Missing fundAmount");
        proposalMsg = makeFundCommunityPool({
          ...vals,
          amount: vals.fundAmount[0].amount,
          depositor: walletAddress,
          denom,
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

  const proposalTabs = useMemo(() => {
    const tabs: {
      title: string;
      msgType: QueryParams["msgType"];
      content: ReactNode;
    }[] = [
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
                support or agreement on a certain topic or idea. Text proposals
                do not contain any code, and do not directly enact changes after
                a passing vote.
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
                This is a governance proposal that executes code after a passing
                vote. The JSON Permit grants{" "}
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
                bundle generated during the <Code>agoric run</Code> process. The
                resulting installation can be referenced in a{" "}
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
      {
        title: "Community Spend Proposal",
        msgType: "communityPoolSpendProposal",
        content: <CommunitySpend />,
      },
      {
        title: "Fund Community Pool",
        msgType: "fundCommunityPool",
        content: <FundCommunityPool />,
      },
    ];

    return tabs.filter((tab) =>
      enabledProposals.includes(tab.msgType as QueryParams["msgType"]),
    );
  }, [enabledProposals, handleProposal, handleBundle]);
  const [alertBox, setAlertBox] = useState(true);

  const { minDeposit } = useQueries({
    queries: [depositParamsQuery(api), votingParamsQuery(api)],
    combine: (
      results: [
        UseQueryResult<DepositParams, unknown>,
        UseQueryResult<VotingParams, unknown>,
      ],
    ) => {
      const [deposit, voting] = results;
      return {
        minDeposit: deposit.data?.minDeposit,
        votingPeriod: voting.data?.votingPeriod,
      };
    },
  });

  return (
    <>
    {minDeposit &&
        (!coinwealth || coinsUnit(coinwealth) < coinsUnit(minDeposit)) &&
        alertBox && (
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
                      {renderCoins(minDeposit)}
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
   {/* <AlertBox coins={coinwealth} /> */}
      <Tabs tabs={proposalTabs} />
    </>
  );
};

export { ProposalsLandingPage };
