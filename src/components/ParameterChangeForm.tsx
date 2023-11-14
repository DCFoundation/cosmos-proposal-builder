import {
  forwardRef,
  useCallback,
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
import { BeansPerUnit } from "../types/swingset";
import type { FormValue, ParameterChangeTypeOption } from "../types/form";
import { toast } from "react-toastify";

type ParameterChangeFormMethods = {
  getChanges: () => ParamChange[];
};

type ParameterChangeFormProps<T, R extends FormValue[] | undefined> = {
  options: ParameterChangeTypeOption<T, R>[];
};

function ParameterChangeFormSectionBase<T, R extends FormValue[] | undefined>(
  { options }: ParameterChangeFormProps<T, R>,
  ref: React.ForwardedRef<ParameterChangeFormMethods>
) {
  const { paramType } = qs.parse(useSearch());
  const { api } = useNetwork();
  const match = options.find((x) => x.key === paramType) ?? options[0];
  const [stagedParams, setStagedParams] = useState<FormValue[] | null>(null);
  const paramsQuery = useQuery(match.query(api));

  const currentParams = useMemo(
    () => match.selector(paramsQuery),
    [paramsQuery, match]
  );

  useEffect(() => {
    if (!stagedParams && currentParams) {
      setStagedParams(currentParams);
    }
  }, [currentParams, stagedParams]);

  useEffect(() => {
    setStagedParams(null);
  }, [api]);

  const handleFormTypeChange = (val: ParameterChangeTypeOption<T, R>) => {
    setStagedParams(null);
    if (!api) {
      toast.error("Please select a network!", { autoClose: 3000 });
    }
    navigate(updateSearchString({ paramType: val.key }));
  };

  const feeUnit = useMemo(() => {
    if (currentParams && match.transformColumn === "ist") {
      const param = (currentParams as unknown as BeansPerUnit[]).find(
        (x: BeansPerUnit) => x.key === "feeUnit"
      );
      return param ? Number(param.beans) : null;
    }
    return null;
  }, [currentParams, match]);

  const toIst = useCallback(
    (value: string) => {
      if (feeUnit) return Number(value) / feeUnit;
      return value;
    },
    [feeUnit]
  );
  const fromIst = useCallback(
    (value: string) => {
      if (feeUnit) return String(Number(value) * feeUnit);
      return value;
    },
    [feeUnit]
  );

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
      const changes = match.submitFn(stagedParams);
      if (!changes) throw new Error("Error formatting changes");
      return changes;
    },
  }));

  const handleValueChanged = (key: string, value: string) => {
    if (!stagedParams) return;
    const newParams = [...stagedParams];
    let newVal: string;
    if (match.transformColumn === "ist") {
      newVal = fromIst(value);
    } else {
      newVal = value;
    }
    newParams.forEach(({ key: candidate }, ix) => {
      if (candidate === key) {
        newParams[ix] = {
          key,
          [match.valueKey || "value"]: newVal,
        };
      }
    });
    setStagedParams(newParams);
  };

  return (
    <>
      <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
        <label
          htmlFor="title"
          className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
        >
          Parameter Change Type
        </label>
        <div className="sm:col-span-3">
          <div className="flex justify-end pr-6">
            <ParamsTypeSelector
              paramOptions={options}
              onChange={handleFormTypeChange}
              initialSelected={match as ParameterChangeTypeOption<T, R>}
            />
          </div>
        </div>
      </div>
      <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
        <label
          htmlFor="title"
          className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
        >
          {match.title}
        </label>
        <div className="sm:col-span-3">
          <EditableTable
            headers={match.headers as string[]}
            rows={stagedParams as unknown as RowValue[]}
            handleValueChanged={handleValueChanged}
            transformInput={match.transformColumn === "ist" ? toIst : undefined}
            valueKey={match.valueKey || ("value" as string)}
            inputType={match.inputType || "string"}
          />
        </div>
      </div>
    </>
  );
}

const ParameterChangeFormSection = forwardRef(
  ParameterChangeFormSectionBase
) as <T, R extends FormValue[] | undefined>(
  props: ParameterChangeFormProps<T, R> & {
    ref?: React.ForwardedRef<ParameterChangeFormMethods>;
  }
) => ReturnType<typeof ParameterChangeFormSectionBase>;

export { ParameterChangeFormSection };
