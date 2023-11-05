import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { useNetwork } from "../hooks/useNetwork";
import type { ParamChange } from "cosmjs-types/cosmos/params/v1beta1/params";
import type {
  DepositParams,
  VotingParams,
} from "cosmjs-types/cosmos/gov/v1beta1/gov";

import { ProposalArgs } from "./ProposalForm.tsx";
import { useWallet } from "../hooks/useWallet.ts";

interface ParameterChangeFormProps {
  title: string;
  description: string;
  handleSubmit: (proposal: ProposalArgs) => void;
}

type StringBeans = { key: string; beans: string };
type PowerFlagFee = { power_flag: string; fee: Coin[] };
type Coin = { denom: string; amount: string };
/**
 * TODO: import from "@agoric/cosmic-proto/swingset/swingset.js"
 * which uses camelCase
 */
type SwingsetParams = {
  beans_per_unit: StringBeans[];
  fee_unit_price: Coin[];
  bootstrap_vat_config: string;
  power_flag_fees: PowerFlagFee[];
};

const logged =
  (label: string) =>
  <T,>(x: T) => {
    console.log(label, x);
    return x;
  };

const Unit6 = 1_000_000;

const coinsUnit = (coins: Coin[] | undefined) =>
  coins && coins.length === 1 ? Number(coins[0].amount) / Unit6 : NaN;

const renderCoin = ({ denom, amount }: Coin) => {
  if (denom.startsWith("u")) {
    const bigd = denom.slice(1).toUpperCase();
    const amt = Number(amount) / Unit6;
    return `${amt} ${bigd}`;
  }
  return `${amount} ${denom}`;
};

const renderCoins = (coins: Coin[]) =>
  coins.length > 0 ? coins.map(renderCoin).join(",") : "empty";

const DepositSection: React.FC<unknown> = (_) => {
  const { networkConfig } = useNetwork();
  const { walletAddress } = useWallet();
  const depositRef = useRef<HTMLInputElement>(null);

  const [govParams, setGovParams] = useState<{
    deposit: DepositParams & {
      //  camelCase vs. snake_case
      min_deposit: Coin[];
    };
    voting: VotingParams & {
      //  camelCase vs. snake_case
      voting_period: string;
    };
  } | null>(null);
  const [balances, setBalances] = useState<Coin[] | null>(null);

  const getJSON = async (url: string) =>
    await fetch(url)
      .then((resp) => resp.text()) // TODO: check resp.ok
      .then((s) => JSON.parse(s));

  useEffect(() => {
    const getGovParams = async () => {
      if (!networkConfig) return;
      const base = networkConfig.api[0]; // round-robin etc.
      const [deposit, voting] = await Promise.all([
        getJSON(`${base}/cosmos/gov/v1beta1/params/deposit`),
        getJSON(`${base}/cosmos/gov/v1beta1/params/voting`),
      ]);

      setGovParams({
        deposit: deposit.deposit_params,
        voting: voting.voting_params,
      });
    };
    getGovParams();
  }, [networkConfig]); // should also depend on a "governance epoch"
  // that changes once per voting period / 2 (nyquist)

  useEffect(() => {
    if (depositRef.current && depositRef.current.value === "") {
      depositRef.current.value = `${coinsUnit(govParams?.deposit.min_deposit)}`;
    }
  }, [govParams]);

  useEffect(() => {
    const getBalances = async () => {
      if (!networkConfig) return;
      if (!walletAddress) return;
      const base = networkConfig.api[0]; // round-robin etc.
      const balances = await getJSON(
        `${base}/cosmos/bank/v1beta1/balances/${walletAddress}`
      );
      setBalances(logged("@@Bal")(balances.balances));
    };
    getBalances();
  }, [networkConfig, walletAddress]);

  return (
    <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
      <label
        htmlFor="description"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        Deposit
      </label>
      <div className="mt-2 sm:col-span-3 sm:mt-0">
        <input
          type="number"
          min="0"
          step="1" // ensures integer
          name="deposit"
          id="deposit"
          ref={depositRef}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cardinal-600 sm:max-w-sm sm:text-sm sm:leading-6"
        />
        <p className="mt-3 text-sm leading-6 text-gray-600">
          {govParams && (
            <span>
              A proposal requires{" "}
              <span className="font-semibold">
                {renderCoins(govParams.deposit.min_deposit)}
              </span>{" "}
              to enter voting period.
            </span>
          )}
          <br />
          {balances && (
            <span>
              Current balance
              <span className="font-semibold"> {renderCoins(balances)}</span>.
            </span>
          )}
          <br />
          {govParams && (
            <span>
              Voting Period:{" "}
              <span className="font-semibold">
                {govParams.voting.voting_period}
              </span>
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

const ParameterChangeForm: React.FC<ParameterChangeFormProps> = ({
  title,
  description,
  handleSubmit,
}) => {
  const { networkConfig } = useNetwork();
  const formRef = useRef<HTMLFormElement>(null);
  const [params, setParams] = useState<SwingsetParams | null>(null);
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      if (!networkConfig) return;
      const content = await fetch(
        `${networkConfig.api[0]}/agoric/swingset/params`
      ).then((resp) => resp.text());
      setParams(JSON.parse(content).params);
    };
    getParams();
  }, [networkConfig]); // should also depend on a "governance epoch"
  // that changes once per voting period / 2 (nyquist)

  const findBean = (items: StringBeans[], target: string) =>
    items.find(({ key }) => key === target) || ({} as StringBeans);

  const msgType = "parameterChangeProposal";

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!params) {
      setError("Params not provided.");
      return;
    }
    if (formRef?.current) {
      const formData = new FormData(formRef.current);
      if (formData) {
        const title = (formData.get("title") as string) || "";
        const description = (formData.get("description") as string) || "";
        const deposit = (formData.get("deposit") as string) || "";
        const changes: ParamChange[] = [
          {
            subspace: "swingset",
            key: "beans_per_unit",
            value: JSON.stringify(params.beans_per_unit),
          },
        ];
        return handleSubmit({
          title,
          description,
          deposit: Number(deposit) * Unit6,
          msgType,
          changes,
        });
      }
    }
    throw new Error("Error reading form data.");
  };

  const renderFees = (fees: PowerFlagFee[]) => [
    <tr>
      <th>power_flag</th>
      <th>fee</th>
    </tr>,
    ...fees.map(({ power_flag, fee }) => (
      <tr>
        <td>{power_flag}</td>
        <td>{renderCoins(fee)}</td>
      </tr>
    )),
  ];

  const changeBeans = (key: string, ist: number) => {
    if (!params) return;
    const { beans_per_unit } = params;
    const { beans: feeUnit } = findBean(beans_per_unit, "feeUnit");
    const beans = ist * Number(feeUnit);
    beans_per_unit.forEach(({ key: candidate }, ix) => {
      if (candidate === key) {
        beans_per_unit[ix].beans = `${beans}`;
      }
    });
    setParams({ ...params, beans_per_unit });
  };

  const renderBeans = (items: StringBeans[]) => {
    // We assume fee_unit_price remains 1IST
    const { beans: feeUnit } = findBean(items, "feeUnit");

    return [
      <thead>
        <tr>
          <th>key</th>
          <th>beans</th>
          <th>IST</th>
        </tr>
      </thead>,
      <tbody>
        {items.map(({ key, beans }) => (
          <tr>
            <td>{key}</td>
            <td>{beans}</td>
            <td>
              <input
                type="number"
                name={key}
                onChange={({ target }) =>
                  changeBeans(key, Number(target.value))
                }
                value={Number(beans) / Number(feeUnit)}
                readOnly={key !== "storageByte"}
              />
            </td>
          </tr>
        ))}
      </tbody>,
    ];
  };

  const renderParams = (params: SwingsetParams) => (
    <section>
      <h3>Swingset Params</h3>

      <table>
        <tr>
          <th>beans_per_unit</th>
        </tr>
        {renderBeans(params.beans_per_unit)}
        <tr>
          <th>fee_unit_price</th>
        </tr>
        <tr>
          <td>{renderCoins(params.fee_unit_price)}</td>
        </tr>
        <tr>
          <th>bootstrap_vat_config</th>
        </tr>
        <tr>
          <td>{params.bootstrap_vat_config}</td>
        </tr>
        <tr>
          <th>power_flag_fees</th>
        </tr>
        {renderFees(params.power_flag_fees)}
      </table>
    </section>
  );

  // TODO: factor out the title and description from ProposalForm
  // er... or expand ProposalForm to handle ParamChange?

  return (
    <form ref={formRef} className="py-6 px-8" onSubmit={onSubmit}>
      <section>
        <div className="space-y-12 sm:space-y-16">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              {title}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600">
              {description}
            </p>

            <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
              <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
                >
                  Title
                </label>
                <div className="mt-2 sm:col-span-3 sm:mt-0">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    placeholder="Title"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cardinal-600 sm:max-w-sm sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
                >
                  Description
                </label>
                <div className="mt-2 sm:col-span-3 sm:mt-0">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="block w-full max-w-2xl rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cardinal-600 sm:text-sm sm:leading-6"
                    defaultValue={""}
                    placeholder="Description"
                  />
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Write a few sentences about the proposal and include any
                    relevant links.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-12 sm:space-y-16">
        <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
          {params ? renderParams(params) : []}
          <div className="p-10 text-center">
            <span className="block text-sm leading-6 text-gray-900 sm:pt-1.5"></span>
          </div>
        </div>
      </div>

      <DepositSection />

      <div className="mt-6 flex items-center justify-end gap-x-32">
        <Button
          type="submit"
          Icon={null}
          text="Sign & Submit"
          theme="dark"
          layoutStyle="flex w-1/4"
        />
      </div>
    </form>
  );
};

export { ParameterChangeForm };
