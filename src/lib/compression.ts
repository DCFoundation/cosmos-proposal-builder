const jsonStringToBlob = (text: string): Blob => {
  return new Blob([text], { type: "application/json" });
};

const compressBlob = async (content: Blob): Promise<Blob> => {
  const cs = new CompressionStream("gzip");
  const compressedStream = content.stream().pipeThrough(cs);
  return new Response(compressedStream).blob();
};

export const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = function () {
      const base64data = (reader.result as string).split(",")[1];
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

export const compressBundle = async (
  bundleJson: BundleJson,
): Promise<{ compressedBundle: Uint8Array; uncompressedSize: string }> => {
  const uncompressedBlob = jsonStringToBlob(JSON.stringify(bundleJson));
  const compressedBlob = await compressBlob(uncompressedBlob);
  const compressedBundle = await blobToUint8Array(compressedBlob);

  return {
    compressedBundle,
    uncompressedSize: String(uncompressedBlob.size),
  };
};
