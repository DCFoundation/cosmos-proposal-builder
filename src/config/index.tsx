import { lazy } from "react";
import type { LazyExoticComponent } from "react";
import type { ChainName } from "../hooks/useChain";

//TOFIX: This is a workaround to avoid circular dependencies
export const chainConfigMap: Record<
  ChainName,
  LazyExoticComponent<() => JSX.Element>
> = {
  agoric: lazy(() => import("./agoric")),
  inter: lazy(() => import("./inter")),
  cosmos: lazy(() => import("./cosmos")),
};
