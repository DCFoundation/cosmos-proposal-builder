import { describe, it, expect, vi } from "vitest";
import { installBundle } from "./installBundle";
import type { InstallBundleParams } from "./installBundle";

type ValidateCostInfo = Parameters<
  NonNullable<InstallBundleParams["validateCost"]>
>[0];

const validBundleJson = JSON.stringify({
  moduleFormat: "endoZipBase64",
  endoZipBase64: "AAAA",
  endoZipBase64Sha512: "deadbeef",
});

const baseParams = () => ({
  bundleJson: validBundleJson,
  chunkSizeLimit: Infinity,
  submitter: "agoric1test",
  gzip: vi.fn(async (bytes: Uint8Array) => bytes),
  makeInstallBundleMsg: vi.fn(() => ({ typeUrl: "/install", value: {} })),
  makeSendChunkMsg: vi.fn(() => ({ typeUrl: "/chunk", value: {} })),
  signAndBroadcast: vi.fn(),
  watchBundle: vi.fn(),
});

describe("installBundle validateCost", () => {
  it("aborts before signAndBroadcast when validateCost throws", async () => {
    const params = baseParams();
    const seen: ValidateCostInfo[] = [];
    const validateCost = vi.fn((info: ValidateCostInfo) => {
      seen.push(info);
      throw new Error("insufficient");
    });

    await expect(installBundle({ ...params, validateCost })).rejects.toThrow(
      "insufficient",
    );

    expect(validateCost).toHaveBeenCalledTimes(1);
    expect(seen[0]).toMatchObject({
      compressedSize: expect.any(Number),
      chunked: false,
    });
    expect(params.signAndBroadcast).not.toHaveBeenCalled();
  });

  it("passes chunked=true and chunkCount when bundle exceeds chunk size limit", async () => {
    const params = baseParams();
    const seen: ValidateCostInfo[] = [];
    const validateCost = vi.fn((info: ValidateCostInfo) => {
      seen.push(info);
      throw new Error("stop");
    });

    await expect(
      installBundle({
        ...params,
        chunkSizeLimit: 10,
        validateCost,
      }),
    ).rejects.toThrow("stop");

    expect(seen[0].chunked).toBe(true);
    expect(seen[0].chunkCount).toBeGreaterThan(0);
    expect(params.signAndBroadcast).not.toHaveBeenCalled();
  });

  it("proceeds to signAndBroadcast when validateCost does not throw", async () => {
    const params = baseParams();
    params.signAndBroadcast.mockResolvedValue({
      height: 42,
      msgResponses: [],
    });
    const validateCost = vi.fn();

    await installBundle({ ...params, validateCost });

    expect(validateCost).toHaveBeenCalledTimes(1);
    expect(params.signAndBroadcast).toHaveBeenCalledTimes(1);
  });
});
