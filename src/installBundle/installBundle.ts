import type { EncodeObject } from "@cosmjs/proto-signing";
import type { ChunkedArtifact } from "@agoric/cosmic-proto/swingset/swingset.js";
import { MsgInstallBundleResponse } from "@agoric/cosmic-proto/swingset/msgs.js";
import { chunkBundle, encodeBundle, validateBundleJson } from "./bundle";

export type ToastType = "bundle" | "bundle-chunk" | "proposal";

export type InstallBundleProgress =
  | {
      type: "preflight";
      bundleHash: string;
      uncompressedSize: number;
      compressedSize: number;
      chunked: boolean;
      chunkCount?: number;
    }
  | { type: "bundle-submitted"; bundleHash: string; height: number }
  | {
      type: "manifest-submitted";
      bundleHash: string;
      height: number;
      chunkCount: number;
    }
  | {
      type: "chunk-submitted";
      bundleHash: string;
      height: number;
      index: number;
      total: number;
    }
  | { type: "watching"; bundleHash: string; height: number };

export interface InstallBundleParams {
  bundleJson: string;
  chunkSizeLimit: number;
  submitter: string;
  gzip: (bytes: Uint8Array) => Promise<Uint8Array>;
  makeInstallBundleMsg: (args: {
    compressedBundle?: Uint8Array;
    uncompressedSize: string;
    submitter: string;
    chunkedArtifact?: ChunkedArtifact;
  }) => EncodeObject;
  makeSendChunkMsg: (args: {
    chunkedArtifactId: bigint;
    chunkIndex: bigint;
    chunkData: Uint8Array;
    submitter: string;
  }) => EncodeObject;
  signAndBroadcast: (
    proposalMsg: EncodeObject,
    toastType?: ToastType,
  ) => Promise<
    | { height: number; msgResponses: { typeUrl: string; value: Uint8Array }[] }
    | undefined
  >;
  watchBundle?: (bundleHash: string, height: number) => Promise<void>;
  onProgress?: (event: InstallBundleProgress) => void;
}

export interface InstallBundleResult {
  bundleHash: string;
  blockHeight: number;
  chunked: boolean;
  chunkCount?: number;
  compressedSize: number;
  uncompressedSize: number;
}

export const installBundle = async (
  params: InstallBundleParams,
): Promise<InstallBundleResult> => {
  const {
    bundleJson,
    chunkSizeLimit,
    submitter,
    gzip,
    makeInstallBundleMsg,
    makeSendChunkMsg,
    signAndBroadcast,
    watchBundle,
    onProgress,
  } = params;

  const bundleObject = validateBundleJson(bundleJson);
  const { endoZipBase64Sha512 } = bundleObject;

  const uncompressedBundleBytes = encodeBundle(bundleJson);
  const compressedBundleBytes = await gzip(uncompressedBundleBytes);
  const compressedSize = compressedBundleBytes.byteLength;
  const uncompressedSize = uncompressedBundleBytes.byteLength;

  // Preserve original behavior: chunk decision is based on string length.
  const shouldChunk = bundleJson.length > chunkSizeLimit;
  onProgress?.({
    type: "preflight",
    bundleHash: endoZipBase64Sha512,
    uncompressedSize,
    compressedSize,
    chunked: shouldChunk,
    chunkCount: shouldChunk
      ? Math.ceil(compressedBundleBytes.byteLength / chunkSizeLimit)
      : undefined,
  });

  let blockHeight: number | undefined;

  if (!shouldChunk) {
    const proposalMsg = makeInstallBundleMsg({
      compressedBundle: compressedBundleBytes,
      uncompressedSize: String(uncompressedSize),
      submitter,
    });
    try {
      const txResponse = await signAndBroadcast(proposalMsg, "bundle");
      if (!txResponse) {
        throw new Error("no response for bundle");
      }
      blockHeight = txResponse.height;
      onProgress?.({
        type: "bundle-submitted",
        bundleHash: endoZipBase64Sha512,
        height: blockHeight,
      });
    } catch (error) {
      throw new Error(
        // @ts-expect-error it will be an Error, but null?.message would be fine anyway.
        `Transaction failed to submit bundle to chain: ${error?.message}`,
      );
    }
  } else {
    const { chunks, manifest } = await chunkBundle(
      compressedBundleBytes,
      chunkSizeLimit,
    );

    let chunkedArtifactId: bigint | undefined;
    const proposalMsg = makeInstallBundleMsg({
      uncompressedSize: String(uncompressedSize),
      submitter,
      chunkedArtifact: manifest,
    });
    try {
      const txResponse = await signAndBroadcast(proposalMsg, "bundle");
      if (!txResponse) {
        throw new Error(
          `No transaction response for attempt to submit manifest for bundle ${endoZipBase64Sha512}`,
        );
      }
      blockHeight = txResponse.height;
      const installBundleResponse = txResponse.msgResponses.find(
        (response) =>
          response.typeUrl === "/agoric.swingset.MsgInstallBundleResponse",
      );
      if (!installBundleResponse) {
        throw new Error(
          `No install bundle response found in manifest submission transaction response for bundle ${endoZipBase64Sha512}. This is a software defect. Please report.`,
        );
      }
      ({ chunkedArtifactId } = MsgInstallBundleResponse.decode(
        installBundleResponse.value,
      ));
      if (chunkedArtifactId === undefined) {
        throw new Error(
          `No chunked artifact identifier found in manifest submission transaction response for bundle ${endoZipBase64Sha512}. This is a software defect. Please report.`,
        );
      }
      onProgress?.({
        type: "manifest-submitted",
        bundleHash: endoZipBase64Sha512,
        height: blockHeight,
        chunkCount: chunks.length,
      });
    } catch (error) {
      throw new Error(
        // @ts-expect-error error is going to be an Error, pinky swear.
        `Transaction failed to submit bundle manifest to chain for bundle ${endoZipBase64Sha512}: ${error?.message}`,
      );
    }

    if (chunkedArtifactId === undefined) {
      throw new Error(
        "No chunked artifact identifier found in transaction response. This is a software defect. Please report.",
      );
    }

    for (let i = 0; i < chunks.length; i += 1) {
      await new Promise(resolve => setTimeout(resolve, 15_000));
      const chunk = chunks[i];
      const proposalMsg = makeSendChunkMsg({
        chunkedArtifactId,
        chunkIndex: BigInt(i),
        chunkData: chunk,
        submitter,
      });
      try {
        const txResponse = await signAndBroadcast(proposalMsg, "bundle-chunk");
        if (!txResponse) {
          throw new Error("no transaction response");
        }
        blockHeight = txResponse.height;
        onProgress?.({
          type: "chunk-submitted",
          bundleHash: endoZipBase64Sha512,
          height: blockHeight,
          index: i,
          total: chunks.length,
        });
      } catch (error) {
        throw new Error(
          // @ts-expect-error error will truly be an Error, but ?. can handle it if it's not.
          `Transaction failed to submit bundle chunk ${i} of bundle ${endoZipBase64Sha512} to chain: ${error?.message}`,
        );
      }
    }
  }

  if (blockHeight === undefined) {
    throw new Error(
      "Bundle submitted but transaction response did not provide a block height. This should not occur. Please report.",
    );
  }

  onProgress?.({
    type: "watching",
    bundleHash: endoZipBase64Sha512,
    height: blockHeight,
  });
  if (watchBundle) {
    await watchBundle(endoZipBase64Sha512, blockHeight);
  }

  return {
    bundleHash: endoZipBase64Sha512,
    blockHeight,
    chunked: shouldChunk,
    chunkCount: shouldChunk
      ? Math.ceil(compressedBundleBytes.byteLength / chunkSizeLimit)
      : undefined,
    compressedSize,
    uncompressedSize,
  };
};
