import type { Coin } from "../types/bank";

export const Unit6 = 1_000_000;

export const coinIsGTE = (left: Coin, right: Coin) => {
  if (left.denom !== right.denom) {
    throw Error(`Cannot compare ${left.denom} to ${right.denom}`);
  }
  const leftAmount = BigInt(left.amount);
  const rightAmount = BigInt(right.amount);
  return leftAmount >= rightAmount;
};

export const scaleToDenomBase = (
  coin: Coin | [amount: number, denom: string],
): [amount: number, denom: string] => {
  const { amount, denom } = Array.isArray(coin)
    ? { amount: coin[0], denom: coin[1] }
    : coin;
  if (denom.startsWith("u")) {
    return [Number(amount) / Unit6, denom.slice(1).toUpperCase()];
  }
  return [Number(amount), denom];
};

export const scaleFromDenomBase = (
  amount: number,
  denomBase: string,
  toScaledDenom: string,
) => {
  if (!toScaledDenom.toUpperCase().endsWith(denomBase)) {
    throw Error(`Cannot convert from ${denomBase} to ${toScaledDenom}`);
  }
  const prefix = toScaledDenom.slice(0, -denomBase.length);
  switch (prefix) {
    case "":
      return amount;
    case "u":
      return amount * Unit6;
  }
  throw Error(`Cannot scale ${denomBase} to ${toScaledDenom}`);
};

export const renderCoin = (coin: Coin) => {
  const scaledCoin = scaleToDenomBase(coin);
  return scaledCoin.join(" ");
};

export const renderCoins = (coins: Coin[]) =>
  coins.length > 0 ? coins.map(renderCoin).join(" or ") : "empty";
