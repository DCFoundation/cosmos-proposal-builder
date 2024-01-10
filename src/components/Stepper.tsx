import { ReactNode } from "react";
import { Tab } from "@headlessui/react";
import { classNames } from "../utils/classNames";

interface TabsProps {
  tabs: {
    title: string;
    content: ReactNode;
  }[];
  onChange: (idx: number) => void;
  currentStep: number;
}

const Stepper = ({ tabs, onChange, currentStep }: TabsProps) => {
  const handleChange = (idx: number) => {
    if (!onChange || typeof onChange !== "function") {
      throw new Error("onChange handle not provided.");
    }
    onChange(idx);
  };

  return (
    <Tab.Group selectedIndex={currentStep} onChange={handleChange}>
      <Tab.List className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {tabs.map(({ title }, index) => {
          const isPrev = index < currentStep;
          const isNext = index > currentStep;
          const isCurr = index === currentStep;
          return (
            <Tab
              key={title}
              className={() =>
                classNames(
                  "flex flex-col w-64 py-2 pl-4 border-l-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-1 rounded focus:outline-1 focus:outline-dashed focus:outline-offset-4 focus:outline-gray-300",
                  isCurr && "border-teal-600",
                  isPrev && "hover:border-teal-800",
                  isNext && "border-gray-200 hover:border-gray-300",
                )
              }
            >
              <span
                className={classNames(
                  "text-sm font-medium",
                  isCurr && "text-teal-600",
                  isPrev && "text-gray-500 group-hover:text-teal-800",
                  isNext && "text-gray-500 group-hover:text-gray-800",
                )}
              >
                Step {index + 1}
              </span>
              <span className="text-sm mt-2 font-medium">{title}</span>
            </Tab>
          );
        })}
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
