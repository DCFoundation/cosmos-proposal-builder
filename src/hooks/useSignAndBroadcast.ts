import { SigningStargateClient } from '@cosmjs/stargate';
import { useMemo } from 'react';
import { makeSignAndBroadcast } from '../lib/signAndBroadcast';

export const useSignAndBroadcast = (
  stargateClient: SigningStargateClient | undefined,
  walletAddress: string | null,
  explorerUrl: string | null,
  feeDenom: string | null
) => {
  return useMemo(
    () =>
      makeSignAndBroadcast(
        stargateClient,
        walletAddress,
        explorerUrl,
        feeDenom
      ),
    [stargateClient, walletAddress, explorerUrl, feeDenom]
  );
};
