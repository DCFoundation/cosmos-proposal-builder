import { NetName } from './contexts/network';
import { Keplr } from '@keplr-wallet/types';

declare global {
  interface Window {
    keplr: Keplr;
  }

  interface QueryParams {
    network: NetName;
    msgType:
      | 'coreEvalProposal'
      | 'textProposal'
      | 'installBundle'
      | 'parameterChangeProposal'
      | 'addPSM'
      | 'addVault'
      | 'communityPoolSpendProposal'
      | 'fundCommunityPool';
    paramType: string;
  }

  interface BundleJson {
    moduleFormat: string;
    endoZipBase64: string;
    endoZipBase64Sha512: string;
  }
}
