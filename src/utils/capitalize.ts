/** @returns string with the first letter capitalized */
export const capitalize = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const firstLetterIsUpperCase = (string: string): boolean => {
  return string.charAt(0).toUpperCase() === string.charAt(0);
};
