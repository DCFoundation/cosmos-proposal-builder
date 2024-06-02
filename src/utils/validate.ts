export const isValidBundle = (bundleJson: string): boolean => {
  let parsed: BundleJson;
  try {
    parsed = JSON.parse(bundleJson);
  } catch {
    return false;
  }

  if (parsed.moduleFormat !== 'endoZipBase64') return false;
  if (!parsed.endoZipBase64 || !parsed.endoZipBase64Sha512) return false;
  // @todo check endoZipBase64 vs endoZipBase64Sha512?
  return true;
};
