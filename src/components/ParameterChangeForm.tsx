import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { useNetwork } from "../hooks/useNetwork";
import { ParamChange } from "cosmjs-types/cosmos/params/v1beta1/params";
import { ProposalArgs } from "./ProposalForm.tsx";

interface ParameterChangeFormProps {
  title: string;
  description: string;
  handleSubmit: (proposal: ProposalArgs) => void;
}

type StringBeans = { key: string; beans: string };
type PowerFlagFee = { power_flag: string; fee: Coins[] };
type Coins = { denom: string; amount: string };
/**
 * TODO: import from "@agoric/cosmic-proto/swingset/swingset.js"
 * which uses camelCase
 */
type SwingsetParams = {
  beans_per_unit: StringBeans[];
  fee_unit_price: Coins[];
  bootstrap_vat_config: string;
  power_flag_fees: PowerFlagFee[];
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
          deposit,
          msgType,
          changes,
        });
      }
    }
    throw new Error("Error reading form data.");
  };

  const renderCoins = (coins: Coins[]) => (
    <td>{coins.map(({ denom, amount }) => `${amount} ${denom}`).join(",")}</td>
  );

  const renderFees = (fees: PowerFlagFee[]) => [
    <tr>
      <th>power_flag</th>
      <th>fee</th>
    </tr>,
    ...fees.map(({ power_flag, fee }) => (
      <tr>
        <td>{power_flag}</td>
        {renderCoins(fee)}
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
        <tr>{renderCoins(params.fee_unit_price)}</tr>
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
        <div>
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
            {description}
          </p>

          <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
            {params ? renderParams(params) : []}
            <div className="p-10 text-center">
              <span className="block text-sm leading-6 text-gray-900 sm:pt-1.5"></span>
            </div>
          </div>
        </div>
      </div>

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
            defaultValue="0"
            name="deposit"
            id="deposit"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cardinal-600 sm:max-w-sm sm:text-sm sm:leading-6"
          />
          <p className="mt-3 text-sm leading-6 text-gray-600">
            A proposal requires{" "}
            <span className="font-semibold">XXX10,000 ubld</span> to enter
            voting period. Current balance{" "}
            <span className="font-semibold">XX0 ubld</span>.
          </p>
        </div>
      </div>

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
