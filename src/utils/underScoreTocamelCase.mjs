export const toCamelCase = (str) => {
  return str.replace(/([-_][a-z])/gi, (match) =>
    match.toUpperCase().replace('-', '').replace('_', '')
  );
};

export const keysToCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      result[toCamelCase(key)] = keysToCamelCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
};

export const selectImageUrl = (network) => {
  if (network.logoURIs) {
    const svgUrl = network.logoURIs.svg;
    return svgUrl || network.logoURIs.png;
  }
  if (network.images) {
    const svgUrl = network.images[0].svg;
    return svgUrl || network.images[0].png;
  }
  return null;
};
