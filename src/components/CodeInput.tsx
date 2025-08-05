import type { Coin } from "../types/bank";
import { useState, forwardRef, useImperativeHandle, useMemo } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { bytesToSize } from "../utils/bytesToSize";
import { CodePreviewModal } from "./CodePreviewModal";
import { DragDrop, DragDropProps } from "./DragDrop";
import { IconButton } from "./IconButton";
import { classNames } from "../utils/classNames";
import { scaleToDenomBase } from "../utils/coin";

interface CodeInputProps {
  label: string;
  onContentChange: (content: string) => void;
  accept: DragDropProps["accept"];
  index?: number;
  prismTag: string;
  subtitle: DragDropProps["subtitle"];
  costPerByte?: [amount: number, denom: string];
  accountBalances?: Coin[];
}

interface FileState {
  filename: string;
  size: number;
  content: string;
}

export interface CodeInputMethods {
  reset: () => void;
  getBundleCost?: () => [amount: number, denom: string] | null;
}

const CodeInput = forwardRef<CodeInputMethods, CodeInputProps>(
  (
    {
      label,
      onContentChange,
      accept,
      prismTag,
      subtitle,
      costPerByte,
      accountBalances,
    },
    ref,
  ) => {
    const [{ filename, size, content }, setState] = useState<
      FileState | Record<string, never>
    >({});

    const onDrop = (acceptedFiles: FileList) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onload = () => {
        const newContent = reader.result as string;
        setState({
          filename: file.name,
          size: file.size,
          content: newContent,
        });
        onContentChange(newContent);
      };

      reader.readAsText(file);
    };

    useImperativeHandle(ref, () => ({
      reset: () => {
        setState({});
      },
      getBundleCost: () => bundleCost,
    }));

    const bundleCost = useMemo(() => {
      if (!costPerByte || !size) return null;
      return [costPerByte[0] * size, costPerByte[1]] as typeof costPerByte;
    }, [costPerByte, size]);

    const remainingCost = useMemo(() => {
      if (!bundleCost || !accountBalances) return bundleCost;
      const [amount, denom] = bundleCost;
      const denomBalance = accountBalances.find((x) => x.denom === denom);
      if (!denomBalance) return bundleCost;
      return Math.max(amount - Number(denomBalance.amount), 0);
    }, [bundleCost, accountBalances]);

    return (
      <div className="flex flex-col">
        {!content ? (
          <div className="mt-2 min-w-full">
            <DragDrop
              label={`Upload a ${label}`}
              onFilesAdded={onDrop}
              accept={accept}
              subtitle={subtitle}
              afterEl={
                costPerByte ? (
                  <p className="text-xs leading-5 text-gray-600">
                    Upload Cost: {scaleToDenomBase(costPerByte).join(" ")} per
                    byte
                  </p>
                ) : null
              }
            />
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex flex-row text-sm font-medium break-all">
              {filename && size ? (
                <>
                  <span className="max-w-lg">{filename}</span>
                  <span className="mx-1">-</span>
                  <span>{bytesToSize(size)}</span>
                </>
              ) : null}
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row mt-2">
                <CodePreviewModal
                  modalTitle={filename}
                  prismTag={prismTag}
                  content={content}
                />
                <IconButton
                  Icon={TrashIcon}
                  label="Delete"
                  onClick={() => setState({})}
                  buttonClassName="ml-3"
                />
              </div>
              {bundleCost ? (
                <div className="self-end">
                  <p className="mt-2 text-sm text-gray-600">
                    Upload Cost:{" "}
                    <span className="font-medium">
                      {scaleToDenomBase(bundleCost).join(" ")}
                    </span>
                  </p>
                  <p
                    className={classNames(
                      "mt-2 text-sm",
                      !remainingCost ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {!remainingCost
                      ? "Sufficient balance."
                      : "Insufficient balance."}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
  },
);

export { CodeInput };
