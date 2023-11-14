import { TrashIcon } from "@heroicons/react/24/solid";
import { classNames } from "../utils/classNames";

interface IconButtonProps {
  onClick: () => void;
  Icon: typeof TrashIcon;
  label: string;
  buttonClassName?: string;
}

export const IconButton = ({
  onClick,
  Icon,
  label,
  buttonClassName,
}: IconButtonProps) => (
  <div className="relative flex justify-center items-center">
    <button
      type="button"
      className={classNames(
        "has-tooltip rounded-full bg-teal-600 p-2 text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600",
        buttonClassName || ""
      )}
      onClick={onClick}
    >
      <span className="tooltip absolute z-10 w-auto p-2 text-sm text-white bg-gray-900 rounded shadow-lg bottom-full transform -translate-x-1/2 -translate-y-2">
        {label}
      </span>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  </div>
);
