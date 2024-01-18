/**
 * The web form only collects, denom, decimalPlaces, and issuuerName.
 * `keyword`, `oracleBrand`, and `proposedName` are derived from issuerName.
 * `keyword` might be be modified to ensure the first chraracter is uppercase.
 */
type AddVaultParams = {
  denom: string;
  decimalPlaces: number;
  keyword: string;
  issuerName: string;
  oracleBrand: string;
  proposedName: string;
  oracleAddresses: string[];
};
