import {
  useRef,
  useState,
  DragEvent,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { CodeBracketSquareIcon } from "@heroicons/react/24/solid";
import { classNames } from "../utils/classNames";

export interface DragDropProps {
  onFilesAdded: (files: FileList) => void;
  multiple?: boolean;
  accept?: InputHTMLAttributes<HTMLInputElement>["accept"];
  label: string;
  subtitle?: string;
  afterEl?: ReactNode;
}

const DragDrop: React.FC<DragDropProps> = ({
  onFilesAdded,
  multiple,
  accept,
  label,
  subtitle,
  afterEl = null,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer && e.dataTransfer.files) {
      onFilesAdded(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(e.target.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={classNames(
        "flex max-w-2xl justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10",
        isDragging ? "border-cardinal-600 bg-gray-300/10" : ""
      )}
    >
      <div className="text-center">
        <CodeBracketSquareIcon
          className="mx-auto h-12 w-12 text-gray-300"
          aria-hidden="true"
        />
        <div className="mt-4 flex text-sm leading-6 text-gray-600">
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer rounded-md bg-white font-semibold text-cardinal-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-cardinal-600 focus-within:ring-offset-2 hover:text-cardinal-500"
          >
            <span>{label}</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple={!!multiple}
              accept={accept}
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        {subtitle ? (
          <p className="text-xs leading-5 text-gray-600">{subtitle}</p>
        ) : null}
        {afterEl}
      </div>
    </div>
  );
};

export { DragDrop };
