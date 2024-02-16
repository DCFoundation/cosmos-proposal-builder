import { agoric, cosmos } from "@agoric/cosmic-proto";
import { StdFee } from "@cosmjs/amino";
import { fromBech32 } from "@cosmjs/encoding";
import { coins } from "@cosmjs/proto-signing";
import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import type { ParamChange } from "cosmjs-types/cosmos/params/v1beta1/params";
import { ParameterChangeProposal } from "cosmjs-types/cosmos/params/v1beta1/params";
import { Any } from "cosmjs-types/google/protobuf/any";
import type { CoreEvalProposal } from "@agoric/cosmic-proto/dist/codegen/agoric/swingset/swingset";

interface MakeTextProposalArgs {
  title: string;
  description: string;
  proposer: string;
  deposit?: string | number;
}

export const makeTextProposalMsg = ({
  title,
  description,
  proposer,
  deposit,
}: MakeTextProposalArgs) => ({
  typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal",
  value: {
    content: Any.fromPartial({
      typeUrl: "/cosmos.gov.v1beta1.TextProposal",
      value: Uint8Array.from(
        TextProposal.encode(
          TextProposal.fromPartial({
            title,
            description,
          })
        ).finish()
      ),
    }),
    proposer,
    ...(deposit &&
      Number(deposit) && { initialDeposit: coins(deposit, "ubld") }),
  },
});

export const makeCoreEvalProposalMsg = ({
  title,
  description,
  evals,
  proposer,
  deposit,
}: CoreEvalProposal & { proposer: string; deposit?: string | number }) => {
  return cosmos.gov.v1beta1.MsgSubmitProposal.fromPartial({
    // @ts-expect-error FIXME generate union instead of intersection types
    content: agoric.swingset.CoreEvalProposal.fromPartial({
      title,
      description,
      evals,
    }),
    proposer,
    ...(deposit &&
      Number(deposit) && { initialDeposit: coins(deposit, "ubld") }),
  });
};

export interface ParamChangeArgs {
  title: string;
  description: string;
  changes: ParamChange[];
  proposer: string;
  deposit?: number | string;
}

export const makeParamChangeProposalMsg = ({
  title,
  description,
  changes,
  proposer,
  deposit = 1000000,
}: ParamChangeArgs) => ({
  typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal",
  value: {
    content: Any.fromPartial({
      typeUrl: "/cosmos.params.v1beta1.ParameterChangeProposal",
      value: Uint8Array.from(
        ParameterChangeProposal.encode(
          ParameterChangeProposal.fromPartial({
            title,
            description,
            changes,
          })
        ).finish()
      ),
    }),
    proposer,
    ...(deposit &&
      Number(deposit) && { initialDeposit: coins(deposit, "ubld") }),
  },
});

export interface MsgInstallArgs {
  compressedBundle: Uint8Array;
  uncompressedSize: string;
  submitter: string;
}

export const makeInstallBundleMsg = ({
  compressedBundle,
  uncompressedSize,
  submitter,
}: MsgInstallArgs) => ({
  typeUrl: "/agoric.swingset.MsgInstallBundle",
  value: {
    compressedBundle,
    uncompressedSize,
    submitter: fromBech32(submitter).data,
  },
});

interface MakeFeeObjectArgs {
  denom?: string;
  amount?: string | number;
  gas?: string | number;
}

export const makeFeeObject = ({ denom, amount, gas }: MakeFeeObjectArgs) =>
  ({
    amount: coins(amount || 0, denom || "uist"),
    gas: gas ? String(gas) : "auto",
  }) as StdFee;
