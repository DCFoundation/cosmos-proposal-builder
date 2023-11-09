import type { UseQueryOptions } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

export type FormValue = { key: string; [value: string]: unknown };

export type ParameterChangeTypeOption<T, R extends FormValue[] | undefined> = {
  title: string;
  description: string;
  subspace: string;
  key: string;
  valueKey?: string;
  transformColumn?: "ist";
  headers: string[];
  query: (
    api: string | undefined,
    walletAddress?: string
  ) => UseQueryOptions<T, unknown>;
  selector: (data: UseQueryResult<T, unknown>) => R;
  inputType?: HTMLInputElement["type"];
  submitFn: (
    values: FormValue[]
  ) => { subspace: string; key: string; value: string }[];
};
