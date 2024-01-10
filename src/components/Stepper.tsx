import { ReactNode, useState } from "react";
import { Tab } from "@headlessui/react";
import { classNames } from "../utils/classNames";

interface TabsProps {
  tabs: {
    title: string;
    content: ReactNode;
  }[];
  onChange?: (idx: number) => void;
  initialIndex?: number;
}

const Stepper = ({ tabs, onChange, initialIndex = 0 }: TabsProps) => {
  const [selectedIdx, setSelectedIdx] = useState(initialIndex);

  const handleChange = (idx: number) => {
    setSelectedIdx(idx);
    if (onChange && typeof onChange === "function") onChange(idx);
  };

  return (
    <Tab.Group selectedIndex={selectedIdx} onChange={handleChange}>
      <Tab.List className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {tabs.map(({ title }, index) => (
          <Tab
            key={title}
            className={() =>
              classNames(
                "flex flex-col py-2 pl-4 border-teal-600 border-l-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                selectedIdx < index ? "hover:border-teal-800" : "",
                selectedIdx > index
                  ? "border-gray-200 hover:border-gray-300"
                  : "",
              )
            }
          >
            <span
              className={classNames(
                "text-sm font-medium text-teal-600",
                selectedIdx < index ? "group-hover:text-teal-800" : "",
                selectedIdx > index
                  ? "text-gray-500 group-hover:text-gray-700"
                  : "",
              )}
            >
              Step {index + 1}
            </span>
            <span className="text-sm font-medium">{title}</span>
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-6">
        {tabs.map(({ content }, idx) => (
          <Tab.Panel key={idx} unmount={false}>
            {content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export { Stepper };
