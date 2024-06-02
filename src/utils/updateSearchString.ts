import qs from 'query-string';

export const updateSearchString = (newParam: Partial<QueryParams>) =>
  `${window.location.pathname}?${qs.stringify(
    Object.assign(qs.parse(window.location.search), newParam)
  )}`;
