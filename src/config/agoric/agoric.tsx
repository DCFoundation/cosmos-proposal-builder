import { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Code } from "../../components/inline";
import { BundleForm, BundleFormArgs } from "../../components/BundleForm";
import { ProposalForm, ProposalArgs } from "../../components/ProposalForm";
import { Tabs } from "../../components/Tabs";
import {
  GovV1ParameterInputs,
  GovV1ParameterInputsMethods,
} from "../../components/GovV1ParameterInputs";
import { useNetwork } from "../../hooks/useNetwork";
import { useWallet } from "../../hooks/useWallet";
import { gzip } from "../../lib/compression";
import {
  makeCoreEvalProposalMsg,
  makeTextProposalMsg,
  makeInstallBundleMsg,
  makeSendChunkMsg,
  makeParamChangeProposalMsg,
  makeCommunityPoolSpendProposalMsg,
  makeGovV1ProposalMsg,
  makeMsgUpdateGovParams,
  createGovV1UpdateParamsAny,
} from "../../lib/messageBuilder";
import { makeSignAndBroadcast } from "../../lib/signAndBroadcast";
import { useWatchBundle } from "../../hooks/useWatchBundle";
import { coinIsGTE, renderCoins } from "../../utils/coin.ts";
import { useQueries, useQuery, UseQueryResult } from "@tanstack/react-query";
import { installBundle } from "../../installBundle";

import {
  accountBalancesQuery,
  moduleAccountQuery,
  depositParamsQuery,
  votingParamsQuery,
  swingSetParamsQuery,
} from "../../lib/queries.ts";
import { selectCoinBalance } from "../../lib/selectors.ts";
import { DepositParams, VotingParams } from "../../types/gov.ts";

const locale = "en";

const { format: formatBytesQuantity } = new Intl.NumberFormat(locale, {
  notation: "compact",
  style: "unit",
  unit: "byte",
});
const { format: formatPercent } = new Intl.NumberFormat(locale, {
  style: "percent",
  // @ts-expect-error Until the web platform types catch up.
  maximimumFractionDigits: 0,
});
const pluralRules = new Intl.PluralRules(locale);
const pluralizeEn = (count: number, singular: string, plural: string) => {
  const category = pluralRules.select(count);
  return category === "one" ? `${count} ${singular}` : `${count} ${plural}`;
};

const Agoric = () => {
  const { netName, networkConfig } = useNetwork();
  const { api } = useNetwork();
  const { walletAddress, stargateClient } = useWallet();
  const proposalFormRef = useRef<HTMLFormElement>(null);
  const corEvalFormRef = useRef<HTMLFormElement>(null);
  const bundleFormRef = useRef<HTMLFormElement>(null);
  const govV1ParamsRef = useRef<GovV1ParameterInputsMethods>(null);
  const watchBundle = useWatchBundle(networkConfig?.rpc, {
    clipboard: window.navigator.clipboard,
  });

  const enableChunking = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has("enable-chunking");
  }, []);

  const swingSetParams = useQuery(swingSetParamsQuery(api));
  const chunkSizeLimit = (({ isLoading, data }) => {
    if (!enableChunking) return Infinity;
    if (isLoading || !data) {
      return Infinity;
    }
    const { chunk_size_limit_bytes = "" } = data;
    if (chunk_size_limit_bytes === "") {
      return Infinity;
    }
    return Number(chunk_size_limit_bytes);
  })(swingSetParams ?? { isLoading: false });

  const accountBalances = useQuery(accountBalancesQuery(api, walletAddress));
  const { minDeposit } = useQueries({
    queries: [depositParamsQuery(api), votingParamsQuery(api)],
    combine: (
      results: [
        UseQueryResult<DepositParams, Error>,
        UseQueryResult<VotingParams, Error>,
      ],
    ) => {
      const [deposit, voting] = results;
      return {
        minDeposit: deposit.data?.min_deposit,
        votingPeriod: voting.data?.voting_period,
      };
    },
  });

  const { data: defaultAuthorityAddress } = useQuery(
    moduleAccountQuery(api, "gov"),
  );

  const signAndBroadcast = useMemo(
    () => makeSignAndBroadcast(stargateClient, walletAddress, netName),
    [stargateClient, walletAddress, netName],
  );

  async function handleBundle(args: BundleFormArgs) {
    await null;
    try {
      return await fallibleHandleBundle(args);
    } catch (unknownError) {
      const error = unknownError as Error & { autoCloseToast?: number };
      toast.error(error.message, { autoClose: error.autoCloseToast });
    }
  }

  async function fallibleHandleBundle(args: BundleFormArgs) {
    // Must be captured here to narrow optionality of walletAddress.
    if (!walletAddress) {
      throw Object.assign(new Error("wallet not connected"), {
        autoCloseToast: 3000,
      });
    }

    const bundleString: string = args.bundle;

    await installBundle({
      bundleJson: bundleString,
      chunkSizeLimit,
      submitter: walletAddress,
      gzip,
      makeInstallBundleMsg,
      makeSendChunkMsg,
      signAndBroadcast,
      watchBundle,
      onProgress: (event) => {
        if (event.type !== "preflight") return;
        const compressionSavings =
          event.compressedSize / event.uncompressedSize - 1;
        const txInfo = [
          `${formatBytesQuantity(event.uncompressedSize)} uncompressed`,
          `${formatBytesQuantity(event.compressedSize)} (${formatPercent(
            compressionSavings,
          )}) compressed`,
        ];
        if (!event.chunked) {
          const txSummary = "Submitting bundle in one transaction";
          toast.info([txSummary, ...txInfo].join(", "));
          return;
        }
        const chunkCount = event.chunkCount ?? 0;
        const txCount = chunkCount + 1;
        const txEn = pluralizeEn(txCount, "transaction", "transactions");
        const chunkEn = pluralizeEn(chunkCount, "chunk", "chunks");
        const txSummary = `Submitting bundle in ${txCount} ${txEn} (1 manifest and ${chunkCount} ${chunkEn})`;
        toast.info([txSummary, ...txInfo].join(", "));
      },
    });
    bundleFormRef.current?.reset();
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

      if (msgType === "communityPoolSpendProposal") {
        if (!("recipient" in vals) || !("amount" in vals)) {
          throw new Error("Missing recipient or amount");
        }
        proposalMsg = makeCommunityPoolSpendProposalMsg({
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

  // Special handler for Gov v1 parameter changes
  function handleGovV1ParameterChange() {
    return async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!walletAddress) {
        toast.error("Wallet not connected.", { autoClose: 3000 });
        throw new Error("wallet not connected");
      }

      const formData = new FormData(event.target as HTMLFormElement);

      // Extract Gov v1 form data
      const authority = formData.get("authority") as string;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;

      if (!authority || !title || !description) {
        toast.error("Please fill in all required fields.", { autoClose: 3000 });
        return;
      }

      // Get form data from the Gov v1 component using ref (following ParameterChangeForm pattern)
      const govV1FormData = govV1ParamsRef.current?.getFormData();
      if (!govV1FormData) {
        toast.error(
          "Gov v1 parameter data not available. Please ensure the form is loaded.",
          { autoClose: 3000 },
        );
        return;
      }

      if (govV1ParamsRef.current?.hasValidationErrors()) {
        const errors = govV1ParamsRef.current.getValidationErrors();
        const errorMessages = Object.entries(errors)
          .filter(([_, error]) => error)
          .map(([field, error]) => `${field}: ${error}`)
          .join(', ');
        toast.error(`Please fix validation errors: ${errorMessages}`, { autoClose: 5000 });
        return;
      }

      try {
        // 1. Create MsgUpdateParams
        const msgUpdateParams = makeMsgUpdateGovParams({
          authority,
          formData: govV1FormData,
        });

        // 2. Encode as Any
        const anyMsg = createGovV1UpdateParamsAny(msgUpdateParams);

        // 3. Create MsgSubmitProposal with the encoded message
        const proposalMsg = makeGovV1ProposalMsg({
          messages: [anyMsg],
          initialDeposit: minDeposit || [],
          proposer: walletAddress,
          metadata: "",
          title,
          summary: description,
        });

        // 4. Submit
        await signAndBroadcast(proposalMsg, "proposal");
        proposalFormRef.current?.reset();

        toast.success("Gov v1 parameter change proposal submitted!", {
          autoClose: 5000,
        });
      } catch (e) {
        console.error(e);
        toast.error("Failed to submit proposal. Check console for details.", {
          autoClose: 5000,
        });
      }
    };
  }

  const [alertBox, setAlertBox] = useState(true);

  const canDeposit = useMemo(
    () =>
      !minDeposit ||
      minDeposit.some((cost) => {
        const balance = selectCoinBalance(accountBalances, cost.denom);
        return balance && coinIsGTE(balance, cost);
      }),
    [minDeposit, accountBalances],
  );

  return (
    <>
      {!canDeposit && alertBox && (
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
                  {renderCoins(minDeposit!)}
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
                    and the JS Script can start or update a contract. These
                    files can be generated with the <Code>agoric run</Code>{" "}
                    command. For more details, see the{" "}
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
                // XXX paramDescriptors should be passed in as prop
              />
            ),
          },
          {
            title: "Community Pool Spend",
            msgType: "communityPoolSpendProposal",
            content: (
              <ProposalForm
                title="Community Pool Spend Proposal"
                handleSubmit={handleProposal("communityPoolSpendProposal")}
                description="This is a governance proposal to spend funds from the community pool."
                governanceForumLink="https://community.agoric.com/c/governance/community-pool-spend-proposals/15"
                msgType="communityPoolSpendProposal"
              />
            ),
          },
          {
            title: "Gov v1 Parameters",
            msgType: "govV1ParameterChange",
            content: (
              <form onSubmit={handleGovV1ParameterChange()}>
                <div className="space-y-12 sm:space-y-16">
                  <div>
                    <h2 className="text-[28px] font-semibold text-blue">
                      Gov v1 Parameter Change Proposal
                    </h2>
                    <p className="mt-4 text-sm text-grey">
                      This is a governance proposal to update governance module
                      parameters using Gov v1. This includes settings like
                      voting periods, deposit requirements, and burn settings.
                    </p>

                    <div className="mt-[30px] border-t border-dotted border-lightgrey py-[20px] sm:border-t sm:pb-0">
                      {/* Title and Description - moved to top */}
                      <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-1.5 sm:pb-6">
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-blue"
                        >
                          Title
                        </label>
                        <div>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            placeholder="Update Governance Parameters"
                            className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-light placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-red"
                            required
                          />
                        </div>
                      </div>

                      <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-1.5 sm:pb-6">
                        <label
                          htmlFor="description"
                          className="text-sm font-medium text-blue"
                        >
                          Description
                        </label>
                        <div>
                          <textarea
                            name="description"
                            id="description"
                            rows={4}
                            placeholder="Describe the parameter changes and their rationale..."
                            className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-light placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-red"
                            required
                          />
                        </div>
                      </div>

                      {/* Gov v1 Parameters - moved below title/description */}
                      <GovV1ParameterInputs
                        defaultAuthorityAddress={defaultAuthorityAddress}
                        ref={govV1ParamsRef}
                      />

                      {/* Submit Button */}
                      <div className="pt-6">
                        <button
                          type="submit"
                          disabled={!canDeposit}
                          className="inline-flex justify-center rounded-md bg-red px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red disabled:opacity-50"
                        >
                          Submit Proposal
                        </button>
                        {!canDeposit && (
                          <p className="mt-2 text-sm text-gray-600">
                            Insufficient balance for proposal deposit:{" "}
                            {renderCoins(minDeposit || [])}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            ),
          },
        ]}
      />
    </>
  );
};

export { Agoric };
