export function stepFromValue(initialValue: string | number): number {
  const valueString = initialValue.toString();
  const [_, decimals] = valueString.split('.');
  if (!decimals) return 1;
  return 1 / 10 ** decimals.length;
}
