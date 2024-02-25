import {
  useRef,
  useState,
  DragEvent,
  InputHTMLAttributes,
  ReactNode,
} from "react";
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
        "flex justify-center rounded-lg border border-dashed border-[#ADB7CA] p-5",
        isDragging ? "border-teal-600 bg-gray-300/10" : "",
      )}
    >
      <div className="text-center">
        <svg className={`mx-auto`} xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none">
          <path d="M24.0833 24.0833L31.1666 17L24.0833 9.91667M9.91665 9.91667L2.83331 17L9.91665 24.0833M19.8333 4.25L14.1666 29.75" stroke="#D3482C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <div className="mt-4 flex flex-wrap text-sm text-gray-600">
          <div className={`basis-full`}>
            <label
              htmlFor={label}
              className="relative cursor-pointer rounded-md bg-white font-semibold text-teal-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-teal-600 focus-within:ring-offset-2 hover:text-teal-500"
            >
              <div className={`flex flex-wrap`}>
                <div className={`basis-full`}>
                  <span className={`text-[#D3482C] text-base`}>{label}</span>
                </div>
                <div className={`basis-full`}>
                  <input
                    id={label}
                    ref={fileInputRef}
                    type="file"
                    multiple={!!multiple}
                    accept={accept}
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </label>
          </div>
          <div className={`basis-full`}>
            <p className="text-[#5E5E5E]">or drag and drop</p>
          </div>
        </div>
        {subtitle ? (
          <p className="text-xs text-[#A2A2A2] mt-[10px]">{subtitle}</p>
        ) : null}
        {afterEl}
      </div>
    </div>
  );
};

export { DragDrop };
