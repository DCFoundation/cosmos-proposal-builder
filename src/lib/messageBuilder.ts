import { CoreEvalProposal } from "@agoric/cosmic-proto/swingset/swingset.js";
import { MsgInstallBundle } from "@agoric/cosmic-proto/swingset/msgs.js";
import { StdFee } from "@cosmjs/amino";
import { fromBech32 } from "@cosmjs/encoding";
import { coins, Registry } from "@cosmjs/proto-signing";
import { defaultRegistryTypes } from "@cosmjs/stargate";
import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { Any } from "cosmjs-types/google/protobuf/any";

export const registry = new Registry([
  ...defaultRegistryTypes,
  ["/agoric.swingset.MsgInstallBundle", MsgInstallBundle],
]);

interface MakeTextProposalArgs {
  title: string;
  description: string;
  proposer: string;
  depositAmount?: number;
}

export const makeTextProposalMsg = ({
  title,
  description,
  proposer,
  depositAmount = 1000000,
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
    initialDeposit: coins(depositAmount, "ubld"),
  },
});

export const makeCoreEvalProposalMsg = ({
  title,
  description,
  evals,
  proposer,
  depositAmount = 1000000,
}: CoreEvalProposal & { proposer: string; depositAmount?: number }) => ({
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
    initialDeposit: coins(depositAmount || 0, "ubld"),
  },
});

export interface MsgInstallArgs {
  bundle: string;
  submitter: string;
}

export const makeInstallBundleMsg = ({
  bundle,
  submitter,
}: MsgInstallArgs) => ({
  typeUrl: "/agoric.swingset.MsgInstallBundle",
  value: Uint8Array.from(
    MsgInstallBundle.encode(
      MsgInstallBundle.fromPartial({
        bundle,
        submitter: fromBech32(submitter).data,
      })
    ).finish()
  ),
});

interface MakeFeeObjectArgs {
  denom?: string;
  amount?: string | number;
  gas?: string | number;
}

export const makeFeeObject = ({ denom, amount, gas }: MakeFeeObjectArgs) =>
  ({
    amount: coins(amount || 2000, denom || "ubld"),
    gas: gas ? String(gas) : "180000",
  } as StdFee);

