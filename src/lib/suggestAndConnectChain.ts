import { Decimal } from '@cosmjs/math';
import { SigningStargateClient } from '@cosmjs/stargate';

import { registry } from '../lib/messageBuilder';
import { AccountData, ChainInfo } from '@keplr-wallet/types';

export const suggestAndEnableChain = async (
  chainInfo: ChainInfo
): Promise<void> => {
  await window.keplr.experimentalSuggestChain(chainInfo);
  await window.keplr.enable(chainInfo.chainId);
};

export const connectStargateClient = async (
  chainInfo: ChainInfo,
  offlineSigner: ReturnType<typeof window.keplr.getOfflineSigner>
): Promise<{
  walletAddress: string | null;
  stargateClient: SigningStargateClient | null;
}> => {
  const { rpc, feeCurrencies } = chainInfo;
  const accounts: readonly AccountData[] = await offlineSigner.getAccounts();
  const stargateClient = await SigningStargateClient.connectWithSigner(
    rpc,
    offlineSigner,
    {
      registry,
      gasPrice: {
        denom: feeCurrencies[0].coinMinimalDenom,
        amount: Decimal.fromUserInput('50000000', 0),
      },
    }
  );
  return {
    walletAddress: accounts[0]?.address ?? null,
    stargateClient: stargateClient ?? null,
  };
};
