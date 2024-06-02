import { Bech32Config } from '@keplr-wallet/types';

export const generateBech32Config = (bech32Prefix: string): Bech32Config => ({
  bech32PrefixAccAddr: bech32Prefix,
  bech32PrefixAccPub: `${bech32Prefix}pub`,
  bech32PrefixValAddr: `${bech32Prefix}valoper`,
  bech32PrefixValPub: `${bech32Prefix}valoperpub`,
  bech32PrefixConsAddr: `${bech32Prefix}valcons`,
  bech32PrefixConsPub: `${bech32Prefix}valconspub`,
});
