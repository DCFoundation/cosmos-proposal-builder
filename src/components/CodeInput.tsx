import { useState, forwardRef, useImperativeHandle, useMemo } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { bytesToSize } from "../utils/bytesToSize";
import { CodePreviewModal } from "./CodePreviewModal";
import { DragDrop, DragDropProps } from "./DragDrop";
import { IconButton } from "./IconButton";
import { classNames } from "../utils/classNames";

interface CodeInputProps {
  label: string;
  onContentChange: (content: string) => void;
  accept: DragDropProps["accept"];
  index?: number;
  prismTag: string;
  subtitle: DragDropProps["subtitle"];
  costPerByte?: number;
  istBalance?: bigint;
}

interface FileState {
  filename: string;
  size: number;
  content: string;
}

export interface CodeInputMethods {
  reset: () => void;
  getBundleCost?: () => number | null;
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
      istBalance,
    },
    ref
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
      if (costPerByte && size) return costPerByte * size;
      return null;
    }, [costPerByte, size]);

    const remainingCost = useMemo(() => {
      if (istBalance && bundleCost) {
        return Math.max(bundleCost - Number(istBalance) / 10 ** 6, 0);
      }
      return bundleCost;
    }, [bundleCost, istBalance]);

    return (
      <div className="flex flex-col mr-8">
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
                    Upload Cost: {costPerByte} IST per byte
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
                    <span className="font-medium">{bundleCost} IST</span>
                  </p>
                  <p
                    className={classNames(
                      "mt-2 text-sm",
                      !remainingCost ? "text-green-600" : "text-red-600"
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
  }
);

export { CodeInput };
