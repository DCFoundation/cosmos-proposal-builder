import type { UseQueryOptions } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

export type FormValue = { key: string; [value: string]: unknown };

export type ValueTransformation<T, U> = {
  transformValue?: (value: T) => U;
  untransformValue?: (transformed: U) => T;
  transformedLabel?: string;
};

export type ParameterChangeTypeDescriptor<
  T,
  R extends FormValue[] | undefined,
> = {
  title: string;
  description: string;
  subspace: string;
  key: string;
  valueKey?: string;
  transformColumn?: "ist";
  headers: string[];
  readOnlyKeys?: string[];
  query: (
    api: string | undefined,
    walletAddress?: string,
  ) => UseQueryOptions<T, unknown>;
  selector: (data: UseQueryResult<T, unknown>) => R;
  getTransformation?: <
    Value extends string,
    Projection extends string | number,
  >(
    data: UseQueryResult<T, unknown>,
  ) => ValueTransformation<Value, Projection> | undefined;
  inputType?: HTMLInputElement["type"];
  submitFn: (
    values: FormValue[],
  ) => { subspace: string; key: string; value: string }[];
};
