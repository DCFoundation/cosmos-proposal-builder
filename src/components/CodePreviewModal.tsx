import { useState } from "react";
import { EyeIcon } from "@heroicons/react/24/solid";
import { Modal } from "./Modal";
import { CodeHighlight, CodeHighlightProps } from "./CodeHighlight";

interface CodePreviewModalProps extends CodeHighlightProps {
  modalTitle: string;
}

const CodePreviewModal = ({
  content,
  prismTag,
  modalTitle,
}: CodePreviewModalProps) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <button
        type="button"
        className="rounded-full bg-cardinal-600 p-2 text-white shadow-sm hover:bg-cardinal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cardinal-600"
        onClick={() => {
          console.log("hey there");
          setShowModal(true);
        }}
      >
        <EyeIcon className="h-5 w-5" aria-hidden="true" />
      </button>
      <Modal
        title={modalTitle}
        open={showModal}
        onClose={() => setShowModal(false)}
      >
        <CodeHighlight content={content} prismTag={prismTag} />
      </Modal>
    </>
  );
};

export { CodePreviewModal };
