import type { Coin } from "../types/bank";
import type { InstallCostRates } from "../lib/selectors";

export type CostPerByte = [amount: number, denom: string];
export type BundleCost = [amount: number, denom: string];

export const calculateBundleCost = (
  costPerByte: CostPerByte | undefined,
  sizeBytes: number | undefined,
): BundleCost | null => {
  if (!costPerByte || !sizeBytes) return null;
  return [costPerByte[0] * sizeBytes, costPerByte[1]];
};

// Mirrors agoric-sdk x/swingset chargeAdmission: each tx is charged
//   inboundTx + message*N + messageByte*Σbytes + storageByte*storageLen.
// For a chunked install: 1 manifest tx (storageLen = uncompressedSize, no
// message bytes since the client uses the chunkedArtifact field rather than
// the legacy Bundle string) + N MsgSendChunk txs (each: storageLen and
// message bytes both equal len(chunkData), summing to compressedSize).
export const calculateInstallCost = (
  rates: InstallCostRates | undefined,
  uncompressedSize: number | undefined,
  compressedSize: number | undefined,
  chunkSizeLimit: number,
): BundleCost | null => {
  if (!rates || !uncompressedSize || !compressedSize) return null;
  const willChunk = uncompressedSize > chunkSizeLimit;
  const chunkCount = willChunk
    ? Math.ceil(compressedSize / chunkSizeLimit)
    : 0;
  const txCount = willChunk ? chunkCount + 1 : 1;
  const messageByteSum = willChunk ? compressedSize : 0;
  const storageByteSum = willChunk
    ? uncompressedSize + compressedSize
    : uncompressedSize;
  const totalBeans =
    txCount * rates.beansPerInboundTx +
    txCount * rates.beansPerMessage +
    messageByteSum * rates.beansPerMessageByte +
    storageByteSum * rates.beansPerStorageByte;
  const amount = (totalBeans / rates.beansPerFeeUnit) * rates.feeUnitAmount;
  return [amount, rates.feeUnitDenom];
};

export const calculateRemainingCost = (
  bundleCost: BundleCost | null,
  accountBalances?: Coin[],
): number | null => {
  if (!bundleCost) return null;
  if (!accountBalances) return bundleCost[0];
  const [amount, denom] = bundleCost;
  const denomBalance = accountBalances.find((x) => x.denom === denom);
  if (!denomBalance) return amount;
  return Math.max(amount - Number(denomBalance.amount), 0);
};

export const hasSufficientBalance = (
  bundleCost: BundleCost | null,
  accountBalances?: Coin[],
): boolean | null => {
  const remaining = calculateRemainingCost(bundleCost, accountBalances);
  if (remaining === null) return null;
  return remaining === 0;
};
