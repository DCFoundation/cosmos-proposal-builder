import React from 'react';

export const AssetInfo: React.FC<unknown> = () => {
  return (
    <form name="assetInfo">
      <fieldset>
        <caption>Asset Info</caption>
        <label>
          Name:
          <br /> <input type="text" name="issuerName" placeholder="ABC" />
        </label>
        <br />
        <label>
          decimalPlaces:
          <br />
          <input type="number" name="decimalPlaces" defaultValue={6} min={1} />
        </label>
        <br />
        <label>
          denom:
          <br /> <input type="text" name="denom" placeholder="ibc/DEADBEEF" />
        </label>
        <ul style={{ fontSize: 'small', fontStyle: 'italic' }}>
          <li>
            <em>stretch goal: oracle support: addresses</em>
          </li>
          <li>
            <em>stretch goal: vault collateral option</em>
          </li>
        </ul>
      </fieldset>
    </form>
  );
};
