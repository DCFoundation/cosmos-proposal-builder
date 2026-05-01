import {
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
  useEffect,
  FormEvent,
  useMemo,
  ReactNode,
} from "react";
import { MsgInstallBundle } from "@agoric/cosmic-proto/swingset/msgs.js";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CodeInput, CodeInputMethods } from "./CodeInput";
import { Button } from "./Button";
import { useNetwork } from "../hooks/useNetwork";
import { accountBalancesQuery, swingSetParamsQuery } from "../lib/queries";

import {
  selectStorageCost,
  selectCoinBalance,
  selectInstallCostRates,
} from "../lib/selectors";
import { useWallet } from "../hooks/useWallet";
import {
  calculateInstallCost,
  calculateRemainingCost,
} from "../installBundle";
import { gzip } from "../lib/compression";

export type BundleFormArgs = Pick<MsgInstallBundle, "bundle">;

interface BundleFormProps {
  title: string;
  description: string | ReactNode;
  handleSubmit: (proposal: BundleFormArgs) => void;
  chunkSizeLimit: number;
}

interface BundleFormMethods {
  reset: () => void;
}

const BundleForm = forwardRef<BundleFormMethods, BundleFormProps>(
  ({ title, description, handleSubmit, chunkSizeLimit }, ref) => {
    const [bundle, setBundle] = useState<BundleFormArgs["bundle"] | null>(null);
    const [uncompressedSize, setUncompressedSize] = useState<
      number | undefined
    >(undefined);
    const [compressedSize, setCompressedSize] = useState<number | undefined>(
      undefined,
    );
    const formRef = useRef<HTMLFormElement>(null);
    const codeInputRef = useRef<CodeInputMethods | null>(null);
    const { api } = useNetwork();
    const { walletAddress } = useWallet();
    const swingsetParams = useQuery(swingSetParamsQuery(api));
    const costPerByte = useMemo(
      () => selectStorageCost(swingsetParams),
      [swingsetParams],
    );
    const installCostRates = useMemo(
      () => selectInstallCostRates(swingsetParams),
      [swingsetParams],
    );
    const accountBalances = useQuery(accountBalancesQuery(api, walletAddress));

    useEffect(() => {
      if (!bundle) {
        setUncompressedSize(undefined);
        setCompressedSize(undefined);
        return;
      }
      const bytes = new TextEncoder().encode(bundle);
      setUncompressedSize(bytes.byteLength);
      let cancelled = false;
      gzip(bytes).then((compressed) => {
        if (!cancelled) setCompressedSize(compressed.byteLength);
      });
      return () => {
        cancelled = true;
      };
    }, [bundle]);

    const bundleCost = useMemo(
      () =>
        calculateInstallCost(
          installCostRates,
          uncompressedSize,
          compressedSize,
          chunkSizeLimit,
        ),
      [installCostRates, uncompressedSize, compressedSize, chunkSizeLimit],
    );

    const remainingCost = useMemo(
      () => calculateRemainingCost(bundleCost, accountBalances?.data),
      [bundleCost, accountBalances],
    );

    useImperativeHandle(ref, () => ({
      reset: () => {
        formRef.current?.reset();
        codeInputRef.current?.reset();
        setBundle(null);
      },
    }));

    const onSubmit = (e: FormEvent) => {
      e.preventDefault();
      if (!bundle) {
        toast.error("Bundle JSON not provided.", { autoClose: 3000 });
        return;
      }
      if (bundleCost?.[0]) {
        const balance = selectCoinBalance(accountBalances, bundleCost[1]);
        if (!balance || Number(balance.amount) < bundleCost[0]) {
          toast.error("Insufficient funds to install bundle.", {
            autoClose: 3000,
          });
          return;
        }
      }
      handleSubmit({ bundle });
    };

    return (
      <form ref={formRef} className="" onSubmit={onSubmit}>
        <div className="space-y-12 sm:space-y-16">
          <div>
            <h2 className="text-[28px] font-semibold text-blue">{title}</h2>
            <p className="mt-4 text-sm text-grey">{description}</p>

            <div className="mt-[30px] space-y-3 border-t border-dotted border-lightgrey py-[30px] sm:border-t sm:pb-0">
              <div className="sm:grid sm:grid-cols-1 sm:items-start">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-blue"
                >
                  Bundle JSON
                </label>
                <div className="mt-0">
                  <CodeInput
                    ref={codeInputRef}
                    label="JSON Bundle"
                    accept="application/json"
                    prismTag="lang-json"
                    onContentChange={setBundle}
                    subtitle=".json files permitted"
                    costPerByte={costPerByte}
                    accountBalances={accountBalances?.data}
                    bundleCost={bundleCost}
                    remainingCost={remainingCost}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-32">
          <Button
            type="submit"
            Icon={null}
            text="Sign & Submit"
            theme="red"
            layoutStyle="flex w-1/4"
          />
        </div>
      </form>
    );
  },
);

export { BundleForm };
