import { useState } from "react";
import { EyeIcon } from "@heroicons/react/24/solid";
import { Modal } from "./Modal";
import { CodeHighlight, CodeHighlightProps } from "./CodeHighlight";
import { IconButton } from "./IconButton";

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
      <IconButton
        Icon={EyeIcon}
        label="Preview"
        onClick={() => setShowModal(true)}
      />
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
