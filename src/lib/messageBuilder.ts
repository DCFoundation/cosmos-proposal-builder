import { CoreEvalProposal } from '@agoric/cosmic-proto/swingset/swingset.js';
import { MsgInstallBundle } from '@agoric/cosmic-proto/swingset/msgs.js';
import { StdFee } from '@cosmjs/amino';
import { fromBech32 } from '@cosmjs/encoding';
import { coins, Registry } from '@cosmjs/proto-signing';
import { defaultRegistryTypes } from '@cosmjs/stargate';
import { TextProposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { ParameterChangeProposal } from 'cosmjs-types/cosmos/params/v1beta1/params';
import { Any } from 'cosmjs-types/google/protobuf/any';
import type { ParamChange } from 'cosmjs-types/cosmos/params/v1beta1/params';
import { MsgSubmitProposal } from 'cosmjs-types/cosmos/gov/v1beta1/tx';
import { Coin } from '../types/bank';

export const registry = new Registry([
  ...defaultRegistryTypes,
  ['/agoric.swingset.MsgInstallBundle', MsgInstallBundle],
]);

interface MakeTextProposalArgs {
  title: string;
  description: string;
  proposer: string;
  deposit?: string | number;
  denom: string;
}

interface CustomSpendProposal {
  description: string;
  spend: {
    recipient: string;
    amount: Coin[];
  };
}

export const makeFundCommunityPool = ({
  amount,
  denom,
  depositor,
}: {
  amount: number | string;
  denom: string;
  depositor: string;
}) => ({
  typeUrl: '/cosmos.distribution.v1beta1.MsgFundCommunityPool',
  value: {
    amount: coins(amount, denom),
    depositor,
  },
});

export const makeCommunityPoolSpendProposalMsg = ({
  proposer,
  recipient,
  amount,
  denom,
  title,
  description,
  deposit,
}: {
  proposer: string;
  recipient: string;
  amount: number | string;
  denom: string;
  title: string;
  description: string;
  deposit?: number | string;
}) => {
  const proposalData: CustomSpendProposal = {
    description,
    spend: {
      recipient,
      amount: coins(amount.toString(), denom),
    },
  };

  const msgSubmitProposal: MsgSubmitProposal = {
    content: {
      typeUrl: '/cosmos.gov.v1beta1.TextProposal',
      value: TextProposal.encode(
        TextProposal.fromPartial({
          title: ` Community Pool Spend Proposal - ${title}`,
          description: `
| Description | Spend Amount | Recipient |
| --- | --- | --- |
| ${proposalData.description} | ${proposalData.spend.amount
            .map((coin) => `${coin.amount} ${coin.denom}`)
            .join(', ')} | ${proposalData.spend.recipient}|
          `,
        })
      ).finish(),
    },
    proposer,
    initialDeposit: deposit ? coins(deposit.toString(), denom) : [],
  };

  return {
    typeUrl: '/cosmos.gov.v1beta1.MsgSubmitProposal',
    value: msgSubmitProposal,
  };
};

export const makeTextProposalMsg = ({
  title,
  description,
  proposer,
  deposit,
  denom,
}: MakeTextProposalArgs) => ({
  typeUrl: '/cosmos.gov.v1beta1.MsgSubmitProposal',
  value: {
    content: Any.fromPartial({
      typeUrl: '/cosmos.gov.v1beta1.TextProposal',
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
      Number(deposit) && { initialDeposit: coins(deposit, denom) }),
  },
});

export const makeCoreEvalProposalMsg = ({
  title,
  description,
  evals,
  proposer,
  deposit,
  denom,
}: CoreEvalProposal & {
  proposer: string;
  deposit?: string | number;
  denom: string;
}) => ({
  typeUrl: '/cosmos.gov.v1beta1.MsgSubmitProposal',
  value: {
    content: Any.fromPartial({
      typeUrl: '/agoric.swingset.CoreEvalProposal',
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
      Number(deposit) && { initialDeposit: coins(deposit, denom) }),
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
  denom,
}: ParamChangeArgs & { denom: string }) => ({
  typeUrl: '/cosmos.gov.v1beta1.MsgSubmitProposal',
  value: {
    content: Any.fromPartial({
      typeUrl: '/cosmos.params.v1beta1.ParameterChangeProposal',
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
      Number(deposit) && { initialDeposit: coins(deposit, denom) }),
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
  typeUrl: '/agoric.swingset.MsgInstallBundle',
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

export const makeFeeObject = ({ denom, amount, gas }: MakeFeeObjectArgs) => {
  const fee = {
    amount: coins(amount || 0, denom || 'uist'),
    gas: gas ? String(gas) : 'auto',
  } as StdFee;

  return fee;
};
