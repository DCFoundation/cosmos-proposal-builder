import React, { FormEvent, useEffect, useState } from "react";
import { Button } from "./Button";
import { useNetwork } from "../hooks/useNetwork";

interface ParameterChangeFormProps {
  title: string;
  description: string;
}

type StringBeans = { key: string; beans: string };
type PowerFlagFee = { power_flag: string; fee: Coins[] };
type Coins = { denom: string; amount: string };
type SwingsetParams = {
  beans_per_unit: StringBeans[];
  fee_unit_price: Coins[];
  bootstrap_vat_config: string;
  power_flag_fees: PowerFlagFee[];
};

const ParameterChangeForm: React.FC<ParameterChangeFormProps> = ({
  title,
  description,
}) => {
  const { networkConfig } = useNetwork();
  const [params, setParams] = useState<SwingsetParams | null>(null);
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

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

  const proposeParamChange = async () => {
    alert("TODO");
    return false;
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

  const findFeeUnit = (items: StringBeans[]) =>
    items.find(({ key }) => key === "feeUnit") || ({} as StringBeans);

  const changeBeans = (key: string, ist: number) => {
    if (!params) return;
    const { beans_per_unit } = params;
    const { beans: feeUnit } = findFeeUnit(beans_per_unit);
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
    const { beans: feeUnit } = findFeeUnit(items);

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

  return (
    <form className="py-6 px-8" onSubmit={onSubmit}>
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
      <div className="mt-6 flex items-center justify-end gap-x-32">
        <Button
          onClick={proposeParamChange}
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
