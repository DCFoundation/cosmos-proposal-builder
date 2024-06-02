import { ChainInfo } from '@keplr-wallet/types';
import { useOptimizedQuery } from './useCacheOptimizedQueries';
import { useNetworkConfig, useRestApi, useRpcEntry } from './useChainRegistry';
import { UseQueryResult } from '@tanstack/react-query';
import { generateBech32Config } from '../utils/generateBech32Config';
import { makeCurrency } from '../utils/makeCurrency';
import { BankBalances } from '../types/bank';
import { useMemo } from 'react';
import { selectCoins } from '../lib/selectors';

export const useChainInfo = (
  chainName: string,
  networkName: string
): UseQueryResult<ChainInfo | null> => {
  const {
    data: networkConfig,
    isLoading: isNetworkConfigLoading,
    error: networkConfigError,
  } = useNetworkConfig(chainName, networkName);

  const rpcQuery = useRpcEntry(chainName, networkName);
  const restQuery = useRestApi(chainName, networkName);

  const queryResult = useOptimizedQuery<ChainInfo | null, Error>(
    ['chainInfo', chainName, networkName],
    async () => {
      if (!networkConfig || !rpcQuery.data || !restQuery.data) return null;

      const rpc = rpcQuery.data;
      const rest = restQuery.data;

      const {
        chainName: netChainName,
        chainId,
        bech32Prefix,
        fees,
        slip44,
        staking,
        networkName: netName,
      } = networkConfig;

      const bech32Config = generateBech32Config(bech32Prefix);
      const feeCurrencies = makeCurrency({
        minimalDenom: fees.feeTokens[0].denom,
        gasPriceStep: fees.gasPriceStep,
      });
      const stakeCurrency = staking
        ? makeCurrency({ minimalDenom: staking.stakingTokens[0].denom })
        : undefined;

      return {
        rpc,
        rest,
        chainId,
        chainName: `${netChainName} ${netName}`,
        stakeCurrency,
        feeCurrencies: [feeCurrencies],
        bech32Config,
        bip44: { coinType: slip44 },
        currencies: stakeCurrency
          ? [feeCurrencies, stakeCurrency]
          : [feeCurrencies],
        features: ['stargate', 'ibc-transfer'],
      };
    },
    {
      enabled: !!networkConfig && !!rpcQuery.data && !!restQuery.data,
    }
  );

  return {
    ...queryResult,
    isLoading:
      queryResult.isLoading ||
      isNetworkConfigLoading ||
      rpcQuery.isLoading ||
      restQuery.isLoading,
    error:
      queryResult.error ||
      networkConfigError ||
      rpcQuery.error ||
      restQuery.error ||
      null,
  } as UseQueryResult<ChainInfo | null>;
};

export const useCoinWealth = (
  stakingDenom: string | undefined,
  accountBalances: BankBalances | undefined
) => {
  return useMemo(
    () => selectCoins(stakingDenom, accountBalances),
    [accountBalances, stakingDenom]
  );
};
