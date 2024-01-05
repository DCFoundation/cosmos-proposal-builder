import type { ParameterChangeTypeOption } from "../../types/form";
import {
  swingSetParamsQuery,
  tallyParamsQuery,
  votingParamsQuery,
} from "../../lib/queries";
import {
  selectBeansPerUnit,
  selectTallyParams,
  selectVotingParams,
} from "../../lib/selectors";
import { arrayToObject } from "../../utils/object";
import { SwingSetParams } from "../../types/swingset";
import { TallyParams, VotingParams } from "../../types/gov";

export type QueryType =
  | ReturnType<typeof swingSetParamsQuery>
  | ReturnType<typeof tallyParamsQuery>
  | ReturnType<typeof votingParamsQuery>;

export type SelectorReturnType =
  | ReturnType<typeof selectBeansPerUnit>
  | ReturnType<typeof selectTallyParams>
  | ReturnType<typeof selectVotingParams>;

export const paramOptions = [
  {
    title: "SwingSet Bean Params",
    description:
      "Configure price parameters for SwingSet. These include the cost to deploy a bundle.",
    subspace: "swingset",
    key: "beans_per_unit",
    valueKey: "beans",
    transformColumn: "ist",
    headers: ["Key", "Beans", "IST"],
    inputType: "number",
    query: swingSetParamsQuery,
    selector: selectBeansPerUnit,
    submitFn: (values) => [
      {
        subspace: "swingset",
        key: "beans_per_unit",
        value: JSON.stringify(values),
      },
    ],
  } as ParameterChangeTypeOption<
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
  } as ParameterChangeTypeOption<
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
  } as ParameterChangeTypeOption<
    VotingParams,
    ReturnType<typeof selectVotingParams>
  >,
];
