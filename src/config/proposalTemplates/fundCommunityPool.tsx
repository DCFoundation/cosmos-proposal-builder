import { FormEvent, useMemo, useState } from 'react';
import { makeSignAndBroadcast } from '../../lib/signAndBroadcast';
import { useNetwork } from '../../hooks/useNetwork';
import { useWallet } from '../../hooks/useWallet';
import { toast } from 'react-toastify';
import { makeFundCommunityPool } from '../../lib/messageBuilder';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { accountBalancesQuery } from '../../lib/queries';
import { renderCoins, renderDenom } from '../../utils/coin';
import { Button } from '../../components/Button';
import { WalletConnectButton } from '../../components/WalletConnectButton';
import { selectCoins } from '../../lib/selectors';
import { BankBalances } from '../../types/bank';

const FundCommunityPool = () => {
  const { networkConfig, chainInfo } = useNetwork();
  const { walletAddress, stargateClient } = useWallet();
  const denom = networkConfig?.staking?.stakingTokens[0].denom;
  const [fundAmount, setFundAmount] = useState(0);
  const accountBalancesEnabled = !!chainInfo?.rest && !!walletAddress;
  const accountBalancesQueryOptions = accountBalancesQuery(
    chainInfo?.rest,
    walletAddress,
    accountBalancesEnabled
  );
  const {
    data: accountBalances,
    // isLoading: isAccountBalancesLoading,
  }: UseQueryResult<BankBalances, Error> = useQuery(
    accountBalancesQueryOptions
  );

  const explorerUrl = networkConfig?.explorers?.[0]?.url;

  const coinWealth = useMemo(
    () => selectCoins(denom!, accountBalances),
    [accountBalances, denom]
  );

  const signAndBroadcast = useMemo(
    () =>
      makeSignAndBroadcast(
        stargateClient || undefined,
        walletAddress,
        explorerUrl || null,
        denom || null
      ),
    [stargateClient, walletAddress, explorerUrl, denom]
  );

  const handleProposal = async (e: FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      toast.error('Wallet not connected.', { autoClose: 3000 });
      throw new Error('wallet not connected');
    }
    if (fundAmount === 0) {
      throw new Error('No community pool spend data provided');
    }
    const proposalMsg = makeFundCommunityPool({
      depositor: walletAddress,
      amount: fundAmount,
      denom: denom!,
    });

    try {
      await signAndBroadcast(proposalMsg, 'proposal');
      setFundAmount(0);
    } catch (e) {
      console.error(e);
      toast.error('Error submitting proposal', { autoClose: 3000 });
    }
  };

  // const { data: availableFunds = [] } = useQuery(communityPoolQuery(api!));

  return (
    <form onSubmit={handleProposal}>
      <div className='space-y-12 sm:space-y-16'>
        <div className='grid grid-cols-2 gap-[10px] pt-[20px]'>
          <div className='flex items-center'>
            <label
              htmlFor='fundAmount'
              className='text-sm font-medium text-blue'
            >
              Amount
            </label>
            {denom && (
              <span className='ml-2 text-sm text-gray-500'>
                ({renderDenom(denom)})
              </span>
            )}
          </div>
          <input
            type='text'
            name='fundAmount'
            id='fundAmount'
            className='col-span-2 mt-0 block w-full rounded-md border-0 py-1.5 text-grey shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
            placeholder='Amount to fund the community pool'
            onChange={(e) => setFundAmount(Number(e.target.value))}
          />
          <div className={`basis-auto grow`}>
            <div className={'flex justify-between items-center'}>
              <div className={'basis-auto'}>
                <span>
                  Current balance:{' '}
                  {coinWealth && (
                    <span className='font-semibold'>
                      {renderCoins(coinWealth)}
                    </span>
                  )}
                </span>
              </div>
              <div className={'basis-auto'}>
                {!walletAddress && <WalletConnectButton theme={'white'} />}
              </div>
            </div>
          </div>
          <div className='mt-6 flex items-center justify-end gap-x-32'>
            <Button
              type='submit'
              Icon={null}
              text='Sign & Submit'
              theme='red'
              layoutStyle='flex w-1/4'
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export { FundCommunityPool };
