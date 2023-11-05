import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useNetwork } from "../hooks/useNetwork";
import type { ParamChange } from "cosmjs-types/cosmos/params/v1beta1/params";
import { swingSetParamsQuery } from "../lib/queries";
import { useQuery } from "@tanstack/react-query";
import { selectBeansPerUnit } from "../lib/selectors";
import type { BeansPerUnit } from "../types/swingset";
import { EditableTable, RowValue } from "./EditableTable";
import { ParamsTypeSelector } from "./ParamsTypeSelector";

type ParameterChangeFormMethods = {
  getChanges: () => ParamChange[];
};

export type Transformers = {
  toIst: (value: string) => string | number;
};

const ParameterChangeFormSection = forwardRef<ParameterChangeFormMethods>(
  (_props, ref) => {
    const { api } = useNetwork();
    const [stagedParams, setStagedParams] = useState<BeansPerUnit[] | null>(
      null
    );
    const swingsetParams = useQuery(swingSetParamsQuery(api));
    const currentParams = useMemo(
      () => selectBeansPerUnit(swingsetParams),
      [swingsetParams]
    );

    useEffect(() => {
      if (!stagedParams && currentParams) {
        setStagedParams(currentParams);
      }
    }, [currentParams, stagedParams]);

    const feeUnit = useMemo(() => {
      if (currentParams) {
        const param = currentParams.find((x) => x.key === "feeUnit");
        return param ? Number(param.beans) : null;
      }
      return null;
    }, [currentParams]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        // todo, reset form state after succesful submission, or to initial values
      },
      getChanges: () => {
        if (!stagedParams) throw new Error("No params");
        // to do, throw error/warning if there's no diff
        return [
          {
            subspace: "swingset",
            key: "beans_per_unit",
            value: JSON.stringify(stagedParams),
          },
        ];
      },
    }));

    // todo, make reusable for other params
    const changeBeans = (key: string, value: string) => {
      if (!feeUnit) throw new Error("feeUnit not found");
      if (!stagedParams) return;
      const newParams = [...stagedParams];
      const beans = Number(value) * feeUnit;
      newParams.forEach(({ key: candidate }, ix) => {
        if (candidate === key) {
          newParams[ix].beans = `${beans}`;
        }
      });
      setStagedParams(newParams);
    };

    const transformers: Transformers = {
      toIst: useCallback(
        (value: string) => {
          if (feeUnit) return Number(value) / feeUnit;
          return value;
        },
        [feeUnit]
      ),
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
              <ParamsTypeSelector initialMsgType="beans_per_unit" />
            </div>
          </div>
        </div>
        <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
          <label
            htmlFor="title"
            className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
          >
            SwingSet Beans Params
          </label>
          <div className="sm:col-span-3">
            <EditableTable
              headers={["Key", "Beans", "IST"]}
              rows={stagedParams as unknown as RowValue[]}
              handleValueChanged={changeBeans}
              transformInput={transformers.toIst}
              valueKey="beans"
            />
          </div>
        </div>
      </>
    );
  }
);

export { ParameterChangeFormSection };
