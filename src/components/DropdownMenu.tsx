import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Link } from "wouter";
import { classNames } from "../utils/classNames";

interface DropdownMenuProps {
  status?: "active" | "loading" | "error" | "default";
  title: string;
  items: { label: string; href: string; image?: string }[];
  label: string;
  buttonStyle?: string;
  dropdownItemStyle?: string;
  labelImage?: string;
  showImage?: boolean;
}

const statusColors = {
  active: "bg-green-500",
  loading: "bg-yellow-500",
  error: "bg-red-500",
  default: "bg-gray-500",
};

const DropdownMenu = ({
  title,
  items,
  status,
  label,
  buttonStyle,
  dropdownItemStyle,
  labelImage,
  showImage,
}: DropdownMenuProps) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          className={classNames(
            "inline-flex w-48 justify-between gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
            buttonStyle ? buttonStyle : "",
          )}
        >
          {showImage && labelImage && (
            <img
              src={labelImage}
              alt={label}
              className="w-5 h-5 rounded-full inline-block mr-2 self-center"
            />
          )}
          {status && (
            <div
              className={classNames(
                "w-3 h-3 rounded-full inline-block mr-2 self-center",
                statusColors[status],
              )}
            />
          )}
          <span className={classNames("w-100", !status ? "mx-auto" : "")}>
            {title}
          </span>
          <ChevronDownIcon
            className="-mr-1 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={classNames(
            "absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
            dropdownItemStyle ? dropdownItemStyle : "",
          )}
        >
          <div className="py-1">
            {items.map(({ label, href, image }) => (
              <Menu.Item key={label}>
                {({ active }) => (
                  <Link
                    href={href}
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-4 py-2 text-sm",
                    )}
                  >
                    {showImage && image && (
                      <img
                        src={image}
                        className="w-5 h-5 rounded-full inline-block mr-2 self-center"
                      />
                    )}
                    {label}
                  </Link>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export { DropdownMenu };
