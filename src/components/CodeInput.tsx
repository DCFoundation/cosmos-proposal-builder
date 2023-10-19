import React, { useCallback, useState } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import debounce from "lodash.debounce";

interface CodeInputProps {
  label: string;
  onContentChange: (content: string) => void;
  accept: DropzoneOptions["accept"];
  index?: number;
}

const CodeInput: React.FC<CodeInputProps> = ({
  label,
  onContentChange,
  accept,
  index,
}) => {
  const [content, setContent] = useState<string>("");

  const debouncedContentChange = debounce(onContentChange, 300);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onload = () => {
        const newContent = reader.result as string;
        setContent(newContent);
        debouncedContentChange(newContent);
      };

      reader.readAsText(file);
    },
    [debouncedContentChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: accept as DropzoneOptions["accept"],
    multiple: false,
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedContentChange(newContent);
  };

  return (
    <div className="flex flex-col mx-4">
      <div className="mt-2 min-w-full">
        <div
          {...getRootProps()}
          className="border-dashed border-2 p-10 cursor-pointer mb-2 w-80 text-center"
        >
          <input {...getInputProps()} />
          {/* <p>Drag & drop a {label} file here, or click to select one</p> */}
          <span className="text-sm">{label}</span>
        </div>
      </div>
      <div className="mt-2">
        <textarea
          id={`${label}-${index}`}
          name={`${label}-${index}`}
          value={content}
          onChange={handleTextChange}
          className="block w-full rounded-md border-0 py-1.5 text-wild-sand-900 shadow-sm ring-1 ring-inset ring-wild-sand-300 placeholder:text-wild-sand-400 focus:ring-2 focus:ring-inset focus:ring-cardinal-600 sm:text-sm sm:leading-6"
          rows={10}
          placeholder={`Enter ${label} here`}
        ></textarea>
      </div>
    </div>
  );
};

export { CodeInput };
