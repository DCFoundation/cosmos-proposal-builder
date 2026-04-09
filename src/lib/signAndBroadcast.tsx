import { assertIsDeliverTxSuccess, DeliverTxResponse } from "@cosmjs/stargate";
import type { SigningStargateClient } from "@cosmjs/stargate";
import type { EncodeObject } from "@cosmjs/proto-signing";
import { createId } from "@paralleldrive/cuid2";
import { toast } from "react-toastify";
import type { NetName } from "../hooks/useNetwork";
import { makeFeeObject } from "./messageBuilder";
import { parseError } from "../utils/transactionParser";
import { TxToastMessage } from "../components/TxToastMessage";

export const makeSignAndBroadcast =
  (
    stargateClient: SigningStargateClient | undefined,
    walletAddress: string | null,
    netName: NetName | undefined,
  ) =>
  async (
    proposalMsg: EncodeObject,
    toastType: "bundle" | "bundle-chunk" | "proposal" = "proposal",
  ) => {
    if (!stargateClient) {
      toast.error("Network not connected.", { autoClose: 3000 });
      throw new Error("stargateClient not found");
    }
    if (!walletAddress) throw new Error("wallet not connected");
    const toastId = createId();
    toast.loading("Broadcasting transaction...", {
      toastId,
    });
    let txResult: DeliverTxResponse | undefined;
    try {
      const estimate = await stargateClient.simulate(
        walletAddress,
        [proposalMsg],
        undefined,
      );
      const adjustment = 1.3;
      const gas = Math.ceil(estimate * adjustment);
      txResult = await stargateClient.signAndBroadcast(
        walletAddress,
        [proposalMsg],
        makeFeeObject({ gas }),
      );
      console.info('txResult', txResult);
      assertIsDeliverTxSuccess(txResult);
      // Poll until the node confirms the transaction is indexed, so that
      // state changes from this block are available for subsequent simulate/
      // execute calls (e.g. chunk submissions after a manifest).
      const { transactionHash } = txResult;
      const pollIntervalMs = 1_000;
      const maxAttempts = 30;
      for (let i = 0; i < maxAttempts; i++) {
        const indexed = await stargateClient.getTx(transactionHash);
        console.info('IndexedTx', indexed);
        if (indexed) {
          if (indexed.code !== 0) {
            throw new Error(
              `Transaction ${transactionHash} failed on-chain with code ${indexed.code}`,
            );
          }
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      }
    } catch (e) {
      toast.update(toastId, {
        render: parseError(e as Error),
        type: "error",
        isLoading: false,
        autoClose: 10000,
      });
      throw e;
    }
    if (txResult && txResult.code === 0) {
      toast.update(toastId, {
        render: ({ closeToast }) => (
          <TxToastMessage
            resp={txResult as DeliverTxResponse}
            netName={netName as NetName}
            closeToast={closeToast as () => void}
            type={toastType}
          />
        ),
        type: "success",
        isLoading: false,
      });
      return txResult;
    }
  };
