import { CoreEvalProposal } from "@agoric/cosmic-proto/swingset/swingset.js";
import { MsgInstallBundle } from "@agoric/cosmic-proto/swingset/msgs.js";
import { StdFee } from "@cosmjs/amino";
import { fromBech32 } from "@cosmjs/encoding";
import { coins, Registry } from "@cosmjs/proto-signing";
import { defaultRegistryTypes } from "@cosmjs/stargate";
import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { ParameterChangeProposal } from "cosmjs-types/cosmos/params/v1beta1/params";
import { Any } from "cosmjs-types/google/protobuf/any";
import type { ParamChange } from "cosmjs-types/cosmos/params/v1beta1/params";

export const registry = new Registry([
  ...defaultRegistryTypes,
  // ["/cosmos.tx.v1beta1.Tx", Tx],
  // ["/cosmos.tx.v1beta1.TxBody", TxBody],
  ["/agoric.swingset.MsgInstallBundle", MsgInstallBundle],
]);

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
}: CoreEvalProposal & { proposer: string; deposit?: string | number }) => ({
  typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal",
  value: {
    content: Any.fromPartial({
      typeUrl: "/agoric.swingset.CoreEvalProposal",
      value: Uint8Array.from(
        CoreEvalProposal.encode(
          CoreEvalProposal.fromPartial({
            title,
            description,
            evals,
          })
        ).finish()
      ),
    }),
    proposer,
    ...(deposit &&
      Number(deposit) && { initialDeposit: coins(deposit, "ubld") }),
  },
});

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

// results in error: "Submitter address cannot be empty"
// export const makeInstallBundleMsg = ({
//   compressedBundle,
//   uncompressedSize,
//   submitter,
// }: MsgInstallArgs) => ({
//   typeUrl: "/agoric.swingset.MsgInstallBundle",
//   value: Uint8Array.from(
//     MsgInstallBundle.encode(
//       MsgInstallBundle.fromPartial({
//         compressedBundle,
//         uncompressedSize,
//         submitter: fromBech32(submitter).data,
//       })
//     ).finish()
//   ),
// });

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
    amount: coins(amount || 2000, denom || "ubld"),
    gas: gas ? String(gas) : "auto",
  } as StdFee);
