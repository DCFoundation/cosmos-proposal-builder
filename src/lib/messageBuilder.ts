import {
  CoreEvalProposal,
  ChunkedArtifact,
} from "@agoric/cosmic-proto/swingset/swingset.js";
import {
  MsgInstallBundle,
  MsgSendChunk,
} from "@agoric/cosmic-proto/swingset/msgs.js";
import { StdFee } from "@cosmjs/amino";
import { fromBech32 } from "@cosmjs/encoding";
import { coins, Registry } from "@cosmjs/proto-signing";
import { defaultRegistryTypes } from "@cosmjs/stargate";
import { MsgSubmitProposal as GovV1MsgSubmitProposal } from "cosmjs-types/cosmos/gov/v1/tx";
import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { ParameterChangeProposal } from "cosmjs-types/cosmos/params/v1beta1/params";
import { Any } from "cosmjs-types/google/protobuf/any";
import type { ParamChange } from "cosmjs-types/cosmos/params/v1beta1/params";
import { CommunityPoolSpendProposal } from "cosmjs-types/cosmos/distribution/v1beta1/distribution";
import { MsgUpdateParams as MintMsgUpdateParams } from "cosmjs-types/cosmos/mint/v1beta1/tx";
import type { MintParams } from "../types/gov";

const toLegacyDecAtomics = (value: string) => {
  const trimmed = value.trim();
  const match = trimmed.match(/^(-?)(\d+)(?:\.(\d+))?$/);
  if (!match) throw new Error(`Invalid decimal value: ${value}`);
  const [, sign, whole, frac = ""] = match;
  if (frac.length > 18) {
    throw new Error("Decimal values support up to 18 fractional digits.");
  }
  const atomics = `${whole}${frac.padEnd(18, "0")}`.replace(/^0+(?=\d)/, "");
  return `${sign}${atomics}`;
};

export const registry = new Registry([
  ...defaultRegistryTypes,
  ["/agoric.swingset.MsgInstallBundle", MsgInstallBundle],
  ["/agoric.swingset.MsgSendChunk", MsgSendChunk],
  ["/cosmos.gov.v1.MsgSubmitProposal", GovV1MsgSubmitProposal],
]);

export const makeCommunityPoolSpendProposalMsg = ({
  proposer,
  recipient,
  amount,
  title,
  description,
  deposit,
}: {
  proposer: string;
  recipient: string;
  amount: string;
  title: string;
  description: string;
  deposit?: number | string;
}) => {
  const communityPoolSpendProposal: CommunityPoolSpendProposal = {
    title,
    description,
    recipient,
    amount: coins(amount, "ubld"),
  };
  const msgSubmitProposal = {
    typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal",
    value: {
      content: {
        typeUrl: "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        value: CommunityPoolSpendProposal.encode(
          communityPoolSpendProposal,
        ).finish(),
      },
      proposer: proposer,
      ...(deposit &&
        Number(deposit) && { initialDeposit: coins(deposit, "ubld") }),
    },
  };
  return msgSubmitProposal;
};

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
          }),
        ).finish(),
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
          }),
        ).finish(),
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
          }),
        ).finish(),
      ),
    }),
    proposer,
    ...(deposit &&
      Number(deposit) && { initialDeposit: coins(deposit, "ubld") }),
  },
});

export interface MintUpdateParamsProposalArgs {
  title: string;
  description: string;
  proposer: string;
  authority: string;
  params: MintParams;
  deposit?: number | string;
}

export const makeMintUpdateParamsProposalMsg = ({
  title,
  description,
  proposer,
  authority,
  params,
  deposit = 1000000,
}: MintUpdateParamsProposalArgs) => ({
  typeUrl: "/cosmos.gov.v1.MsgSubmitProposal",
  value: GovV1MsgSubmitProposal.fromPartial({
    messages: [
      Any.fromPartial({
        typeUrl: "/cosmos.mint.v1beta1.MsgUpdateParams",
        value: Uint8Array.from(
          MintMsgUpdateParams.encode(
            MintMsgUpdateParams.fromPartial({
              authority,
              params: {
                mintDenom: params.mint_denom,
                inflationRateChange: toLegacyDecAtomics(
                  params.inflation_rate_change,
                ),
                inflationMax: toLegacyDecAtomics(params.inflation_max),
                inflationMin: toLegacyDecAtomics(params.inflation_min),
                goalBonded: toLegacyDecAtomics(params.goal_bonded),
                blocksPerYear: BigInt(params.blocks_per_year),
              },
            }),
          ).finish(),
        ),
      }),
    ],
    proposer,
    ...(deposit &&
      Number(deposit) && { initialDeposit: coins(deposit, "ubld") }),
    metadata: "",
    title,
    summary: description,
    expedited: false,
  }),
});

export interface MsgInstallArgs {
  uncompressedSize: string;
  compressedBundle?: Uint8Array;
  chunkedArtifact?: ChunkedArtifact;
  submitter: string;
}

export const makeInstallBundleMsg = ({
  compressedBundle,
  uncompressedSize,
  chunkedArtifact,
  submitter,
}: MsgInstallArgs) => ({
  typeUrl: "/agoric.swingset.MsgInstallBundle",
  value: {
    compressedBundle,
    uncompressedSize,
    chunkedArtifact,
    submitter: fromBech32(submitter).data,
  },
});

export interface MsgSendChunkArgs {
  chunkedArtifactId: bigint;
  chunkIndex: bigint;
  chunkData: Uint8Array;
  submitter: string;
}

export const makeSendChunkMsg = ({
  chunkedArtifactId,
  chunkIndex,
  chunkData,
  submitter,
}: MsgSendChunkArgs) => ({
  typeUrl: "/agoric.swingset.MsgSendChunk",
  value: {
    chunkedArtifactId,
    chunkIndex,
    chunkData,
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
