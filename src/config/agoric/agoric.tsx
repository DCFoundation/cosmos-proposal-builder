import { useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Code } from '../../components/inline';
import { BundleForm, BundleFormArgs } from '../../components/BundleForm';
import { ProposalForm, ProposalArgs } from '../../components/ProposalForm';
import { Tabs } from '../../components/Tabs';
import { useNetwork } from '../../hooks/useNetwork';
import { useWallet } from '../../hooks/useWallet';
import { compressBundle } from '../../lib/compression';
import {
  makeCoreEvalProposalMsg,
  makeTextProposalMsg,
  makeInstallBundleMsg,
  makeParamChangeProposalMsg,
  makeCommunityPoolSpendProposalMsg,
} from '../../lib/messageBuilder';
import { isValidBundle } from '../../utils/validate';
import { makeSignAndBroadcast } from '../../lib/signAndBroadcast';
import { useWatchBundle } from '../../hooks/useWatchBundle';
import { coinsUnit, renderCoins } from '../../utils/coin.ts';
import { useQueries, useQuery, UseQueryResult } from '@tanstack/react-query';

import {
  accountBalancesQuery,
  depositParamsQuery,
  votingParamsQuery,
} from '../../lib/queries.ts';
import { selectBldCoins } from '../../lib/selectors.ts';
import { DepositParams, VotingParams } from '../../types/gov.ts';

const Agoric = () => {
  const { netName, networkConfig } = useNetwork();
  const { api } = useNetwork();
  const { walletAddress, stargateClient } = useWallet();
  const proposalFormRef = useRef<HTMLFormElement>(null);
  const corEvalFormRef = useRef<HTMLFormElement>(null);
  const bundleFormRef = useRef<HTMLFormElement>(null);
  const watchBundle = useWatchBundle(networkConfig?.rpc, {
    clipboard: window.navigator.clipboard,
  });

  const accountBalances = useQuery(accountBalancesQuery(api, walletAddress));
  const bldCoins = useMemo(
    () => selectBldCoins(accountBalances),
    [accountBalances],
  );

  const signAndBroadcast = useMemo(
    () => makeSignAndBroadcast(stargateClient, walletAddress, netName),
    [stargateClient, walletAddress, netName],
  );

  async function handleBundle(vals: BundleFormArgs) {
    if (!walletAddress) {
      toast.error('Wallet not connected.', { autoClose: 3000 });
      throw new Error('wallet not connected');
    }
    if (!isValidBundle(vals.bundle)) {
      toast.error('Invalid bundle format.', { autoClose: 3000 });
      throw new Error('Invalid bundle.');
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
      const txResponse = await signAndBroadcast(proposalMsg, 'bundle');
      if (txResponse) {
        const { endoZipBase64Sha512 } = JSON.parse(vals.bundle);
        await watchBundle(endoZipBase64Sha512, txResponse);
        bundleFormRef.current?.reset();
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handleProposal(msgType: QueryParams['msgType']) {
    return async (vals: ProposalArgs) => {
      if (!walletAddress) {
        toast.error('Wallet not connected.', { autoClose: 3000 });
        throw new Error('wallet not connected');
      }
      let proposalMsg;
      if (msgType === 'coreEvalProposal') {
        if (!('evals' in vals)) throw new Error('Missing evals');
        proposalMsg = makeCoreEvalProposalMsg({
          ...vals,
          proposer: walletAddress,
        });
      }
      if (msgType === 'textProposal') {
        proposalMsg = makeTextProposalMsg({
          ...vals,
          proposer: walletAddress,
        });
      }

      if (msgType === 'communityPoolSpendProposal') {
        if (!('recipient' in vals) || !('amount' in vals)) {
          throw new Error('Missing recipient or amount');
        }
        proposalMsg = makeCommunityPoolSpendProposalMsg({
          ...vals,
          proposer: walletAddress,
        });
      }

      if (msgType === 'parameterChangeProposal') {
        if (vals.msgType !== 'parameterChangeProposal') return;
        proposalMsg = makeParamChangeProposalMsg({
          ...vals,
          proposer: walletAddress,
        });
      }
      if (!proposalMsg) throw new Error('Error parsing query or inputs.');

      try {
        await signAndBroadcast(proposalMsg, 'proposal');
        proposalFormRef.current?.reset();
        corEvalFormRef.current?.reset();
      } catch (e) {
        console.error(e);
      }
    };
  }
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
        minDeposit: deposit.data?.min_deposit,
        votingPeriod: voting.data?.voting_period,
      };
    },
  });

  return (
    <>
      {minDeposit &&
        (!bldCoins || coinsUnit(bldCoins) < coinsUnit(minDeposit)) &&
        alertBox && (
          <div
            className={
              'flex justify-center w-full max-w-7xl px-2 py-2 m-auto bg-white rounded-lg -mb-5'
            }
          >
            <div className={'basis-full'}>
              <div
                className={
                  'toast text-center bg-lightblue2 p-4 text-blue font-light rounded-lg flex justify-between items-center'
                }
              >
                <div className={'basis-auto grow pr-4'}>
                  You need to have{' '}
                  <span className={'text-red font-black'}>
                    {renderCoins(minDeposit)}
                  </span>{' '}
                  in your wallet to submit this action
                </div>
                <div className={'basis-auto'}>
                  <svg
                    width='32'
                    height='32'
                    viewBox='0 0 32 32'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className={'cursor-pointer'}
                    onClick={() => setAlertBox(false)}
                  >
                    <rect width='32' height='32' rx='6' fill='white' />
                    <path
                      d='M20.5 11.5L11.5 20.5M11.5 11.5L20.5 20.5'
                      stroke='#0F3941'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
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
            title: 'Text Proposal',
            msgType: 'textProposal',
            content: (
              <ProposalForm
                ref={proposalFormRef}
                handleSubmit={handleProposal('textProposal')}
                titleDescOnly={true}
                title='Text Proposal'
                msgType='textProposal'
                governanceForumLink='https://community.agoric.com/c/governance/signaling-proposals/17'
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
            title: 'CoreEval Proposal',
            msgType: 'coreEvalProposal',
            content: (
              <ProposalForm
                ref={corEvalFormRef}
                handleSubmit={handleProposal('coreEvalProposal')}
                titleDescOnly={false}
                title='CoreEval Proposal'
                msgType='coreEvalProposal'
                governanceForumLink='https://community.agoric.com/c/governance/core-eval/31'
                description={
                  <>
                    This is a governance proposal that executes code after a
                    passing vote. The JSON Permit grants{' '}
                    <a
                      className='cursor-pointer hover:text-gray-900 underline'
                      href='https://docs.agoric.com/guides/coreeval/permissions.html'
                    >
                      capabilities
                    </a>{' '}
                    and the JS Script can start or update a contract. These
                    files can be generated with the <Code>agoric run</Code>{' '}
                    command. For more details, see the{' '}
                    <a
                      className='cursor-pointer hover:text-gray-900 underline'
                      href='https://docs.agoric.com/guides/coreeval/'
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
            title: 'Install Bundle',
            msgType: 'installBundle',
            content: (
              <BundleForm
                ref={bundleFormRef}
                title='Install Bundle'
                handleSubmit={handleBundle}
                description={
                  <>
                    The install bundle message deploys and installs an external
                    bundle generated during the <Code>agoric run</Code> process.
                    The resulting installation can be referenced in a{' '}
                    <a
                      className='cursor-pointer hover:text-gray-900 underline'
                      href='https://docs.agoric.com/guides/coreeval/'
                    >
                      CoreEval proposal
                    </a>{' '}
                    that starts or updates a contract.
                  </>
                }
              />
            ),
          },
          {
            title: 'Parameter Change Proposal',
            msgType: 'parameterChangeProposal',
            content: (
              <ProposalForm
                title='Parameter Change Proposal'
                handleSubmit={handleProposal('parameterChangeProposal')}
                description='This is a governance proposal to change chain configuration parameters.'
                governanceForumLink='https://community.agoric.com/c/governance/parameter-changes/16'
                msgType='parameterChangeProposal'
                // XXX paramOptions should be passed in as prop
              />
            ),
          },
          {
            title: 'Community Pool Spend Proposal',
            msgType: 'communityPoolSpendProposal',
            content: (
              <ProposalForm
                title='Community Pool Spend Proposal'
                handleSubmit={handleProposal('communityPoolSpendProposal')}
                description='This is a governance proposal to spend funds from the community pool.'
                governanceForumLink='https://community.agoric.com/c/governance/community-pool-spend-proposals/15'
                msgType='communityPoolSpendProposal'
              />
            ),
          },
        ]}
      />
    </>
  );
};

export { Agoric };
