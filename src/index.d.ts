import { NetName } from "./contexts/network";
import { Keplr } from "@keplr-wallet/types";

declare global {
  interface Window {
    keplr: Keplr;
  }

  interface NetworkConfig {
    rpc: string;
    chainName: string;
    netName: string;
  }

  interface QueryParams {
    network: NetName;
    msgType:
      | "coreEvalProposal"
      | "textProposal"
      | "installBundle"
      | "parameterChangeProposal";
  }
}
