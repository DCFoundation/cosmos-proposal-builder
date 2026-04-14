import type { ParameterChangeTypeDescriptor } from "../../types/form";
import {
  swingSetParamsQuery,
  tallyParamsQuery,
  votingParamsQuery,
  mintParamsQuery,
} from "../../lib/queries";
import {
  selectBeansPerUnit,
  selectMintParams,
  selectTallyParams,
  selectVotingParams,
} from "../../lib/selectors";
import type { Coin } from "../../types/bank";
import { scaleToDenomBase, scaleFromDenomBase } from "../../utils/coin";
import { arrayToObject } from "../../utils/object";
import { SwingSetParams } from "../../types/swingset";
import { MintParams, TallyParams, VotingParams } from "../../types/gov";

export type QueryType =
  | ReturnType<typeof swingSetParamsQuery>
  | ReturnType<typeof tallyParamsQuery>
  | ReturnType<typeof votingParamsQuery>
  | ReturnType<typeof mintParamsQuery>;

export type SelectorReturnType =
  | ReturnType<typeof selectBeansPerUnit>
  | ReturnType<typeof selectTallyParams>
  | ReturnType<typeof selectVotingParams>
  | ReturnType<typeof selectMintParams>;

export const paramDescriptors = [
  {
    title: "SwingSet Bean Params",
    description:
      "Configure price parameters for SwingSet. These include the cost to deploy a bundle.",
    subspace: "swingset",
    key: "beans_per_unit",
    valueKey: "beans",
    transformColumn: "ist",
    headers: ["Key", "Beans"],
    inputType: "number",
    query: swingSetParamsQuery,
    selector: selectBeansPerUnit,
    getTransformation: (query) => {
      const { isLoading, data } = query;
      if (isLoading || !data) return undefined;

      const feeUnitCoin = data.fee_unit_price?.[0] as Coin | undefined;
      const beansPerFeeUnitRecord = data.beans_per_unit.find(
        (x) => x.key === "feeUnit",
      );
      if (!feeUnitCoin || !beansPerFeeUnitRecord) return undefined;

      const feeUnitAmount = Number(feeUnitCoin.amount);
      const beansPerFeeUnit = Number(beansPerFeeUnitRecord.beans);
      const [_amount, transformedLabel] = scaleToDenomBase(feeUnitCoin);
      const transformValue = (beans: string) => {
        const input = [
          (Number(beans) / beansPerFeeUnit) * feeUnitAmount,
          feeUnitCoin.denom,
        ] as [number, string];
        const scaled = scaleToDenomBase(input);
        return scaled[0];
      };
      const untransformValue = (transformed: string | number) => {
        const asDenomBase =
          (Number(transformed) / feeUnitAmount) * beansPerFeeUnit;
        const beans = scaleFromDenomBase(
          asDenomBase,
          transformedLabel,
          feeUnitCoin.denom,
        );
        return `${Math.round(beans)}`;
      };
      return { transformedLabel, transformValue, untransformValue };
    },
    submitFn: (values) => [
      {
        subspace: "swingset",
        key: "beans_per_unit",
        value: JSON.stringify(values),
      },
    ],
  } as ParameterChangeTypeDescriptor<
    SwingSetParams,
    ReturnType<typeof selectBeansPerUnit>
  >,
  {
    title: "Tally Parameters",
    description: "Configure the vote tally parameters, like quorum.",
    subspace: "gov",
    key: "tally_params",
    valueKey: undefined, // defaults to value
    transformColumn: undefined,
    headers: ["Key", "Value"],
    inputType: "string",
    query: tallyParamsQuery,
    selector: selectTallyParams,
    submitFn: (values) => [
      {
        subspace: "gov",
        key: "tallyparams",
        value: JSON.stringify(
          arrayToObject(values as { key: string; value: string }[]),
        ),
      },
    ],
  } as ParameterChangeTypeDescriptor<
    TallyParams,
    ReturnType<typeof selectTallyParams>
  >,
  {
    title: "Voting Parameters",
    description: "Configure the voting period.",
    subspace: "gov",
    key: "voting_params",
    valueKey: undefined, // defaults to value
    transformColumn: undefined,
    headers: ["Key", "Value"],
    inputType: "string",
    query: votingParamsQuery,
    selector: selectVotingParams,
    submitFn: (values) => [
      {
        subspace: "gov",
        key: "votingparams",
        value: JSON.stringify(
          arrayToObject(values as { key: string; value: string }[]),
        ),
      },
    ],
  } as ParameterChangeTypeDescriptor<
    VotingParams,
    ReturnType<typeof selectVotingParams>
  >,
  {
    title: "Mint Parameters",
    description: "Configure mint parameters (except blocks_per_year).",
    subspace: "mint",
    key: "mint_params",
    valueKey: undefined, // defaults to value
    transformColumn: undefined,
    headers: ["Key", "Value"],
    inputType: "string",
    readOnlyKeys: ["mint_denom", "blocks_per_year"],
    query: mintParamsQuery,
    selector: selectMintParams,
    submitFn: (values) =>
      (values as { key: string; value: string }[]).map(({ key, value }) => ({
        subspace: "mint",
        key,
        value: JSON.stringify(value),
      })),
  } as ParameterChangeTypeDescriptor<
    MintParams,
    ReturnType<typeof selectMintParams>
  >,
];
