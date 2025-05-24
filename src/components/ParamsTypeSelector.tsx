import { ReactNode, Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { classNames } from "../utils/classNames";
import type { FormValue, ParameterChangeTypeDescriptor } from "../types/form";

interface ParamsTypeSelectorProps<T, R extends FormValue[] | undefined> {
  paramDescriptors: ParameterChangeTypeDescriptor<T, R>[];
  initialSelected: ParameterChangeTypeDescriptor<T, R>;
  onChange: (val: ParameterChangeTypeDescriptor<T, R>) => void;
}

const ParamsTypeSelector = <T, R extends FormValue[] | undefined>({
  paramDescriptors,
  initialSelected,
  onChange,
}: ParamsTypeSelectorProps<T, R>): ReactNode => {
  const [selected, setSelected] =
    useState<ParameterChangeTypeDescriptor<T, R>>(initialSelected);

  const handleChange = (newSelection: ParameterChangeTypeDescriptor<T, R>) => {
    setSelected(newSelection);
    if (onChange && typeof onChange === "function") {
      onChange(newSelection);
    }
    // XXX if change, and no network, show modal warning
  };

  return (
    <Listbox value={selected} onChange={handleChange}>
      {({ open }) => (
        <>
          <div className="relative">
            <div className="inline-flex divide-x divide-red rounded-md shadow-sm">
              <div className="inline-flex items-center gap-x-1.5 rounded-l-md bg-red px-4 py-4 text-white shadow-sm">
                <CheckIcon className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                <p className="text-sm font-semibold">{selected.title}</p>
              </div>
              <Listbox.Button className="inline-flex items-center rounded-l-none rounded-r-md bg-red p-2 hover:teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 focus:ring-offset-gray-50">
                <ChevronDownIcon
                  className="h-5 w-5 text-white"
                  aria-hidden="true"
                />
              </Listbox.Button>
            </div>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute right-0 z-10 mt-2 w-72 origin-top-right divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {paramDescriptors.map((paramDesc) => (
                  <Listbox.Option
                    key={paramDesc.key}
                    className={({ active }) =>
                      classNames(
                        active ? "bg-red text-white" : "text-gray-900",
                        "cursor-default select-none p-4 text-sm",
                      )
                    }
                    value={paramDesc}
                  >
                    {({ selected, active }) => (
                      <div
                        className={classNames(
                          "flex flex-col",
                          active ? "cursor-pointer" : "",
                        )}
                      >
                        <div className="flex justify-between">
                          <p
                            className={
                              selected || active
                                ? "font-semibold"
                                : "font-normal"
                            }
                          >
                            {paramDesc.title}
                          </p>
                          {selected ? (
                            <span
                              className={active ? "text-white" : "text-red"}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </div>
                        <p
                          className={classNames(
                            active ? "teal-600Light" : "text-gray-500",
                            "mt-2",
                          )}
                        >
                          {paramDesc.description}
                        </p>
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};

export { ParamsTypeSelector };
