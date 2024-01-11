import { lazy } from "react";
import type { LazyExoticComponent } from "react";
import type { ChainName } from "../hooks/useChain";

export const chainConfigMap: Record<
  ChainName,
  LazyExoticComponent<() => JSX.Element>
> = {
  agoric: lazy(() => import("./agoric")),
  inter: lazy(() => import("./inter")),
};
