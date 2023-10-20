import React, { useState } from "react";
import { bytesToSize } from "../utils/bytesToSize";
import { CodePreviewModal } from "./CodePreviewModalProps";
import { DragDrop, DragDropProps } from "./DragDrop";

interface CodeInputProps {
  label: string;
  onContentChange: (content: string) => void;
  accept: DragDropProps["accept"];
  index?: number;
  prismTag: string;
  subtitle: DragDropProps["subtitle"];
}

interface FileState {
  filename: string;
  size: number;
  content: string;
}

const CodeInput: React.FC<CodeInputProps> = ({
  label,
  onContentChange,
  accept,
  prismTag,
  subtitle,
}) => {
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

  return (
    <div className="flex flex-col mr-8">
      {!content ? (
        <div className="mt-2 min-w-full">
          <DragDrop
            label={`Upload a ${label}`}
            onFilesAdded={onDrop}
            accept={accept}
            subtitle={subtitle}
          />
        </div>
      ) : (
        <div className="mt-2">
          <div className="flex flex-row text-sm font-medium">
            {filename && size ? (
              <>
                <span>{filename}</span>
                <span className="mx-1">-</span>
                <span>{bytesToSize(size)}</span>
              </>
            ) : null}
          </div>
          <CodePreviewModal
            modalTitle={filename}
            prismTag={prismTag}
            content={content}
          />
        </div>
      )}
    </div>
  );
};

export { CodeInput };
