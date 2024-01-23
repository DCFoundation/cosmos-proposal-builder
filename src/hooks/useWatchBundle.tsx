import {
  iterateEach,
  makeCastingSpec,
  makeFollower,
  makeLeader,
} from "@agoric/casting";
import { toast } from "react-toastify";
import { BundleFollowerToastMessage } from "../components/BundleFollowerToastMessage";

type IteratorEnvelope = {
  value?: {
    endoZipBase64Sha512: string;
    installed: boolean;
    error: unknown;
  };
  error?: { message: string; stack: string };
};

export const useWatchBundle = (
  rpcUrl: string | undefined,
  { clipboard }: { clipboard: Navigator["clipboard"] },
) => {
  const leader = rpcUrl ? makeLeader(rpcUrl) : undefined;

  const watchBundle = async (
    expectedEndoZipBase64Sha512: string,
    { height }: { height: number },
  ) => {
    if (!leader) throw Error("Unexpected error: leader not found.");
    const castingSpec = makeCastingSpec(":bundles");
    const follower = makeFollower(castingSpec, leader);
    for await (const envelope of iterateEach(follower, { height })) {
      const { value, error } = envelope as IteratorEnvelope;
      if (!value && error) {
        toast.error(`Bundle installation failed.\nSee console for details.`);
        console.log(envelope);
        throw error;
      }
      if (value) {
        const { endoZipBase64Sha512, installed, error } = value;
        if (endoZipBase64Sha512 === expectedEndoZipBase64Sha512) {
          if (!installed) {
            toast.error(
              `Bundle installation failed.\nSee console for details.`,
            );
            throw error;
          } else {
            toast.success(({ closeToast }) => (
              <BundleFollowerToastMessage
                endoZipBase64Sha512={endoZipBase64Sha512}
                closeToast={closeToast as () => void}
                clipboard={clipboard}
              />
            ));
            return;
          }
        }
      }
    }
  };

  return watchBundle;
};
