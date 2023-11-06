import { DeliverTxResponse } from "@cosmjs/stargate";
import { NetName } from "../contexts/network";

const blockExplorerUrls: Record<NetName, string | null> = {
  local: null,
  devnet: "https://devnet.explorer.agoric.net/agoric",
  emerynet: "https://emerynet.explorer.agoric.net/agoric",
  ollinet: "https://ollinet.explorer.agoric.net/agoric",
  main: "https://ping.pub/agoric",
};

export const getTxUrl = (netName: NetName, txHash: string) => {
  if (!blockExplorerUrls[netName]) return null;
  return `${blockExplorerUrls[netName]}/tx/${txHash}`;
};

export const getGovUrl = (netName: NetName, proposalId: string) => {
  if (!blockExplorerUrls[netName]) return null;
  return `${blockExplorerUrls[netName]}/gov/${proposalId}`;
};

export function parseError(error: Error) {
  if (error.message.includes("does not exist on chain")) {
    // @todo, prompt provisionWallet
    return "Account does not exist. Please provision smart wallet.";
  }
  if (error.message.includes("insufficient funds")) {
    const match = error.message.match(/(\d+)uist is smaller than (\d+)uist/);
    if (match) {
      // todo, round up or more precision
      const availableIst = BigInt(match[1]) / BigInt(1e6);
      const requiredIst = BigInt(match[2]) / BigInt(1e6);
      return `Insufficient funds. ${requiredIst} IST required, only ${availableIst} IST available.`;
    }
  }
  return error.message;
}

export function parseProposal(resp: DeliverTxResponse) {
  const { transactionHash, events } = resp;
  const proposalId = events
    .find((event) => event.type === "submit_proposal")
    ?.attributes.find((attr) => attr.key === "proposal_id")?.value;

  return {
    transactionHash,
    proposalId,
  };
}

// not currently used, no need to show bundleId ?
export function parseBundle(resp: DeliverTxResponse) {
  const { transactionHash, events } = resp;
  const bundleId = events
    .find((event) => event.type === "create_bundle")
    ?.attributes.find((attr) => attr.key === "bundle_id")?.value;

  return {
    transactionHash,
    bundleId,
  };
}
