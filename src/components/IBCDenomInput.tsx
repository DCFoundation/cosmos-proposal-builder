import { Fragment, useMemo, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useQuery } from "@tanstack/react-query";
import { ibcDenomTracesQuery, ibcDenomHashQuery } from "../lib/queries";
import { useNetwork } from "../hooks/useNetwork";
import { DenomTrace } from "../types/bank";
import { selectSinglePathDenomTraces } from "../lib/selectors";

const TraceToHash = ({
  path,
  baseDenom,
}: {
  path: string;
  baseDenom: string;
}) => {
  const { api } = useNetwork();
  const ibcHashTrace = useQuery(ibcDenomHashQuery(api, path, baseDenom));
  if (!ibcHashTrace.data) return null;
  return (
    <>
      {ibcHashTrace.data}
      <input type="hidden" name="denom" value={ibcHashTrace.data} />
    </>
  );
};

const formatTrace = (trace: DenomTrace): string => {
  if (!trace) return "";
  const { base_denom, path } = trace;
  return `${base_denom} ${path}`;
};

const IBCDenomInput = () => {
  const { api } = useNetwork();
  const [selected, setSelected] = useState<DenomTrace | null>(null);
  const [query, setQuery] = useState<string>("");

  const ibcDenomTraces = useQuery(ibcDenomTracesQuery(api));
  const singleChannelTraces = useMemo(
    () => selectSinglePathDenomTraces(ibcDenomTraces),
    [ibcDenomTraces],
  );
  const filtered =
    query === ""
      ? singleChannelTraces || []
      : (singleChannelTraces || []).filter((d) => {
          return d.base_denom.includes(query) || d.path.includes(query);
        });

  return (
    <div className="block">
      <Combobox value={selected} onChange={setSelected}>
        <div className="relative mt-1 sm:max-w-sm">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              name="denomTrace"
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={(token: DenomTrace) => formatTrace(token)}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {filtered.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filtered.map((token) => (
                  <Combobox.Option
                    key={formatTrace(token)}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-teal-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={token}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {formatTrace(token)}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-teal-600"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      <p className="ml-1 mt-3 text-xs leading-6 text-gray-600">
        {selected && (
          <TraceToHash baseDenom={selected.base_denom} path={selected.path} />
        )}
      </p>
    </div>
  );
};

export { IBCDenomInput };
