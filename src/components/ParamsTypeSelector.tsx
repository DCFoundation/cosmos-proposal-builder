import { ReactNode, Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { classNames } from "../utils/classNames";
import { Transformers } from "./ParameterChangeForm";
// import { useLocation } from "wouter";
// import { updateSearchString } from "../utils/updateSearchString";

type ParameterChangeTypeOption = {
  title: string;
  description: string;
  subspace: string; // @todo, add more specific type
  key: string;
  valueKey?: string;
  transformerFn?: keyof Transformers;
  headers: string[];
};

const formTypeOptions: ParameterChangeTypeOption[] = [
  {
    title: "Voting Parameters",
    description: "Configure the voting period.",
    subspace: "gov",
    key: "voting_params",
    valueKey: "beans",
    transformerFn: "toIst",
    headers: ["Key", "Beans", "IST"],
  },
  {
    title: "Tally Parameters",
    description: "Configure the vote tally parameters, like quorum.",
    subspace: "gov",
    key: "tally_params",
    headers: [],
  },
  {
    title: "Deposit Parameters",
    description:
      "Configure the proposal deposit parameters, like minimum deposit.",
    subspace: "gov",
    key: "deposit_params",
    headers: [],
  },
  {
    title: "SwingSet Bean Params",
    description:
      "Configure price parameters for SwingSet. These include the cost to deploy a bundle.",
    subspace: "swingset",
    key: "beans_per_unit",
    headers: [],
  },
  // {
  //   title: "SwingSet Fee Parameters",
  //   description:
  //     "Configure fee unit parameters for SwingSet. This includes...",
  //   subspace: "swingset",
  //   key: "fee_unit_price",
  // },
  // @todo SwingSet bootstrap_vat_config, power_flag_feees, queue_max
  // @todo Distribution Params, Staking Params, Slashing Params
];

interface ParamsTypeSelectorProps {
  initialMsgType: string;
}

const ParamsTypeSelector = ({
  initialMsgType,
}: ParamsTypeSelectorProps): ReactNode => {
  const [selected, setSelected] = useState<ParameterChangeTypeOption>(
    formTypeOptions.find((x) => x.key === initialMsgType) || formTypeOptions[0]
  );
  // const [_, navigate] = useLocation();

  const handleChange = (newSelection: ParameterChangeTypeOption) => {
    setSelected(newSelection);
    // const { key } = newSelection;
    // navigate(updateSearchString({ key }));
  };

  return (
    <Listbox value={selected} onChange={handleChange}>
      {({ open }) => (
        <>
          <div className="relative">
            <div className="inline-flex divide-x divide-cardinal-700 rounded-md shadow-sm">
              <div className="inline-flex items-center gap-x-1.5 rounded-l-md bg-cardinal-600 px-3 py-2 text-white shadow-sm">
                <CheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                <p className="text-sm font-semibold">{selected.title}</p>
              </div>
              <Listbox.Button className="inline-flex items-center rounded-l-none rounded-r-md bg-cardinal-600 p-2 hover:cardinal-700 focus:outline-none focus:ring-2 focus:ring-cardinal-600 focus:ring-offset-2 focus:ring-offset-gray-50">
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
              <Listbox.Options className="absolute right-0 z-10 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {formTypeOptions.map((option) => (
                  <Listbox.Option
                    key={option.key}
                    className={({ active }) =>
                      classNames(
                        active ? "bg-cardinal-600 text-white" : "text-gray-900",
                        "cursor-default select-none p-4 text-sm"
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <div
                        className={classNames(
                          "flex flex-col",
                          active ? "cursor-pointer" : ""
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
                            {option.title}
                          </p>
                          {selected ? (
                            <span
                              className={
                                active ? "text-white" : "text-cardinal-600"
                              }
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
                            active ? "cardinal-600Light" : "text-gray-500",
                            "mt-2"
                          )}
                        >
                          {option.description}
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
