import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import type { ParamChange } from "cosmjs-types/cosmos/params/v1beta1/params";
import { useQuery } from "@tanstack/react-query";
import { navigate, useSearch } from "wouter/use-location";
import qs from "query-string";
import isEqual from "lodash.isequal";
import { useNetwork } from "../hooks/useNetwork";
import { updateSearchString } from "../utils/updateSearchString";
import { EditableTable, RowValue } from "./EditableTable";
import { ParamsTypeSelector } from "./ParamsTypeSelector";
import type {
  FormValue,
  ParameterChangeTypeDescriptor,
  ValueTransformation,
} from "../types/form";
import { toast } from "react-toastify";
import { NetworkDropdown } from "./NetworkDropdown.tsx";

type ParameterChangeFormMethods = {
  getChanges: () => ParamChange[];
};

type ParameterChangeFormProps<T, R extends FormValue[] | undefined> = {
  paramDescriptors: ParameterChangeTypeDescriptor<T, R>[];
};

function ParameterChangeFormSectionBase<T, R extends FormValue[] | undefined>(
  { paramDescriptors }: ParameterChangeFormProps<T, R>,
  ref: React.ForwardedRef<ParameterChangeFormMethods>,
) {
  const { paramType } = qs.parse(useSearch());
  const { api } = useNetwork();
  const activeParamDesc =
    paramDescriptors.find((x) => x.key === paramType) ?? paramDescriptors[0];
  const [stagedParams, setStagedParams] = useState<FormValue[] | null>(null);
  const paramsQuery = useQuery(activeParamDesc.query(api));

  const currentParams = useMemo(
    () => activeParamDesc.selector(paramsQuery),
    [paramsQuery, activeParamDesc],
  );

  const { transformValue, untransformValue, transformedLabel } = useMemo(
    () =>
      activeParamDesc.getTransformation?.(paramsQuery) ??
      ({} as ValueTransformation<string, string | number>),
    [paramsQuery, activeParamDesc],
  );

  useEffect(() => {
    if (!stagedParams && currentParams) {
      setStagedParams(currentParams);
    }
  }, [currentParams, stagedParams]);

  useEffect(() => {
    setStagedParams(null);
  }, [api]);

  const handleFormTypeChange = (val: ParameterChangeTypeDescriptor<T, R>) => {
    setStagedParams(null);
    if (!api) {
      toast.error("Please select a network!", { autoClose: 3000 });
    }
    navigate(updateSearchString({ paramType: val.key }));
  };

  useImperativeHandle(ref, () => ({
    reset: () => {
      // todo, reset form state after succesful submission, or to initial values
    },
    getChanges: () => {
      if (!stagedParams) {
        toast.error("Please select a network!", { autoClose: 3000 });
        throw new Error("No params");
      }
      if (isEqual(stagedParams, currentParams)) {
        toast.error("No parameter changes to submit!", { autoClose: 3000 });
        throw new Error("No changes to submit.");
      }
      const changes = activeParamDesc.submitFn(stagedParams);
      if (!changes) throw new Error("Error formatting changes");
      return changes;
    },
  }));

  const handleValueChanged = (key: string, value: string) => {
    if (!stagedParams) return;
    const newParams = [...stagedParams];
    const newVal = untransformValue ? untransformValue(value) : value;
    newParams.forEach(({ key: candidate }, ix) => {
      if (candidate === key) {
        newParams[ix] = {
          key,
          [activeParamDesc.valueKey || "value"]: newVal,
        };
      }
    });
    setStagedParams(newParams);
  };

  return (
    <>
      <div className="grid grid-cols-1">
        <div>
          <label htmlFor="title" className="text-sm font-medium text-blue">
            Parameter Change Type
          </label>
        </div>
        <div className="pt-[10px]">
          <div className="flex">
            {api && (
              <ParamsTypeSelector
                paramDescriptors={paramDescriptors}
                onChange={handleFormTypeChange}
                initialSelected={
                  activeParamDesc as ParameterChangeTypeDescriptor<T, R>
                }
              />
            )}

            {!api && <NetworkDropdown />}
          </div>
        </div>
      </div>
      {api && (
        <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-4 sm:py-6 mt-6">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-blue"
          >
            {activeParamDesc.title}
          </label>
          <div className={"w-full"}>
            <EditableTable
              headers={activeParamDesc.headers as string[]}
              transformedLabel={transformedLabel}
              rows={stagedParams as unknown as RowValue[]}
              handleValueChanged={handleValueChanged}
              transformValue={transformValue}
              valueKey={activeParamDesc.valueKey || ("value" as string)}
              inputType={activeParamDesc.inputType || "string"}
              readOnlyKeys={activeParamDesc.readOnlyKeys}
            />
          </div>
        </div>
      )}
    </>
  );
}

const ParameterChangeFormSection = forwardRef(
  ParameterChangeFormSectionBase,
) as <T, R extends FormValue[] | undefined>(
  props: ParameterChangeFormProps<T, R> & {
    ref?: React.ForwardedRef<ParameterChangeFormMethods>;
  },
) => ReturnType<typeof ParameterChangeFormSectionBase>;

export { ParameterChangeFormSection };
