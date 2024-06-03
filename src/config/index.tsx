import { useCallback } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
// import { useNetwork } from '../hooks/useNetwork';
import { useWallet } from '../hooks/useWallet';
import { useWatchBundle } from '../hooks/useWatchBundle';
import { accountBalancesQuery } from '../lib/queries';
import { ProposalArgs, ProposalForm } from '../components/ProposalForm';
import { BundleForm, BundleFormArgs } from '../components/BundleForm';
import { Tabs } from '../components/Tabs';
import { isValidBundle } from '../utils/validate';
import { compressBundle } from '../lib/compression';
import { createProposalMessage } from '../utils/createProposalMessage';
import { toast } from 'react-toastify';
import { makeInstallBundleMsg } from '../lib/messageBuilder';

import { AlertBox } from '../components/AlertBox';
import { useNetwork } from '../hooks/useNetwork';
import { BankBalances } from '../types/bank';
// import { useChain } from '../hooks/useChain';
import { usePermittedProposals, useProposals } from '../hooks/useProposals';
import { useCoinWealth } from '../hooks/useChainInfo';
import { useSignAndBroadcast } from '../hooks/useSignAndBroadcast';
import { createId } from '@paralleldrive/cuid2';
import { handleLoadingToast } from './toastHandler';

const networkToastId = createId();
const walletToastId = createId();
const accountBalancesToastId = createId();
const proposalsToastId = createId();
const ProposalsLandingPage = () => {
  // const { currentChain } = useChain();
  const {
    networkConfig,
    chainInfo,
    isLoading: isLoadingNetwork,
    currentChain: currentChainItem,
    error: networkError,
  } = useNetwork();

  const {
    walletAddress,
    stargateClient,
    isLoading: isLoadingWallet,
    connectWallet,
  } = useWallet();

  const stakingDenom = networkConfig?.staking?.stakingTokens[0]?.denom;
  const feeDenom = networkConfig?.fees?.feeTokens[0]?.denom;
  const explorerUrl = networkConfig?.explorers?.[0]?.url;

  const permittedProposals = usePermittedProposals(currentChainItem);
  const watchBundle = useWatchBundle(chainInfo?.rpc, {
    clipboard: window.navigator.clipboard,
  });

  const accountBalancesEnabled = !!chainInfo?.rest && !!walletAddress;
  const accountBalancesQueryOptions = accountBalancesQuery(
    chainInfo?.rest,
    walletAddress,
    accountBalancesEnabled
  );
  const {
    data: accountBalances,
    isLoading: isAccountBalancesLoading,
  }: UseQueryResult<BankBalances, Error> = useQuery(
    accountBalancesQueryOptions
  );

  const coinWealth = useCoinWealth(stakingDenom, accountBalances);
  const signAndBroadcast = useSignAndBroadcast(
    stargateClient || undefined,
    walletAddress,
    explorerUrl || null,
    feeDenom || null
  );

  const handleProposal = useCallback(
    async (msgType: QueryParams['msgType'], proposalData: ProposalArgs) => {
      if (!walletAddress) {
        toast.error('Wallet not connected. Connecting...');
        try {
          await connectWallet();
        } catch (e) {
          toast.error(`Failed to connect wallet: ${e}`);
          return;
        }
      }

      const proposalMsg = createProposalMessage(
        msgType,
        proposalData,
        walletAddress as string,
        stakingDenom as string
      );

      if (!proposalMsg) {
        toast.error('Error creating proposal message');
        return;
      }

      try {
        await signAndBroadcast(proposalMsg, 'proposal');
        toast.success('Proposal submitted successfully');
      } catch (e) {
        console.error('Error submitting proposal:', e);
        toast.error(`Error submitting proposal: ${e}`);
      }
    },
    [walletAddress, stakingDenom, signAndBroadcast, connectWallet]
  );

  const handleBundle = useCallback(
    async (bundleData: BundleFormArgs) => {
      if (!walletAddress) {
        toast.error('Wallet not connected');
        return;
      }

      if (!isValidBundle(bundleData.bundle)) {
        toast.error('Invalid bundle.');
        return;
      }

      const { compressedBundle, uncompressedSize } = await compressBundle(
        JSON.parse(bundleData.bundle)
      );
      const proposalMsg = makeInstallBundleMsg({
        compressedBundle,
        uncompressedSize,
        submitter: walletAddress,
      });

      if (!proposalMsg) {
        toast.error('Error creating bundle proposal message');
        return;
      }

      try {
        const txResponse = await signAndBroadcast(proposalMsg, 'bundle');
        if (txResponse) {
          const { endoZipBase64Sha512 } = JSON.parse(bundleData.bundle);
          await watchBundle(endoZipBase64Sha512, txResponse);
          toast.success('Bundle submitted successfully');
        }
      } catch (e) {
        console.error('Error submitting bundle:', e);
        toast.error(`Error submitting bundle: ${e}`);
      }
    },
    [walletAddress, signAndBroadcast, watchBundle]
  );

  const {
    data: proposalTabs,
    isLoading: isProposalsLoading,
    error: proposalsError,
  } = useProposals(permittedProposals || []);
  {
    handleLoadingToast(isLoadingNetwork, 'Loading network...', networkToastId);
  }
  {
    handleLoadingToast(isLoadingWallet, 'Loading wallet...', walletToastId);
  }
  {
    handleLoadingToast(
      isAccountBalancesLoading,
      'Loading account balances...',
      accountBalancesToastId
    );
  }
  {
    handleLoadingToast(
      isProposalsLoading,
      'Loading proposals...',
      proposalsToastId
    );
  }
  return (
    <div>
      {networkError && <div>Error: {networkError.message}</div>}
      {proposalsError && <div>Error: {proposalsError.message}</div>}
      <AlertBox coins={coinWealth} />

      {proposalTabs ? (
        <Tabs
          tabs={proposalTabs.map((tab) => ({
            ...tab,
            content:
              tab.msgType === 'installBundle' ? (
                <BundleForm
                  title={tab.title}
                  handleSubmit={handleBundle}
                  description={tab.description}
                />
              ) : (
                <ProposalForm
                  handleSubmit={(data) =>
                    handleProposal(tab.msgType, data).catch(console.error)
                  }
                  titleDescOnly={tab.msgType === 'textProposal'}
                  title={tab.title}
                  msgType={tab.msgType}
                  governanceForumLink={tab.governanceForumLink}
                  description={tab.description}
                />
              ),
          }))}
        />
      ) : (
        <div>Loading proposals...</div>
      )}
    </div>
  );
};

export default ProposalsLandingPage;
