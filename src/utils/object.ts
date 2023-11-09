export const isObject = (obj: unknown) =>
  typeof obj === "object" && obj !== null && !Array.isArray(obj);

export const objectToArray = (obj: Record<string, unknown>) =>
  isObject(obj)
    ? Object.entries(obj).map(([key, value]) => ({ key, value }))
    : undefined;

export const arrayToObject = (arr: { key: string; value: unknown }[]) =>
  arr?.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
