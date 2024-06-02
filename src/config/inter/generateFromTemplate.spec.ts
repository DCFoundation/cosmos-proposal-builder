import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { generateFromTemplate } from './generateFromTemplate';
import {
  EMERYNET_ORACLE_OPERATORS,
  MAINNET_ORACLE_OPERATORS,
} from './addVault/constants';

const nodeRequire = createRequire(import.meta.url);
const resolveAsString = (path: string) =>
  readFileSync(nodeRequire.resolve(path), 'utf8');

describe('proposal builders - generateFromTemplate', () => {
  it('should generate code from addPsm template', () => {
    const values: AddPSMParams = {
      decimalPlaces: 6,
      keyword: 'USDC',
      proposedName: 'USDC',
      denom:
        'ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9',
    };
    const template = resolveAsString('./addPSM/gov-start-psm.js');
    const expectedCode = resolveAsString(
      './__fixtures__/gov-start-usdc-psm.js'
    );
    const generatedCode = generateFromTemplate<AddPSMParams>(template, values);
    expect(generatedCode).toEqual(expectedCode);
  });

  it('should generate code from addVault template', () => {
    const values: AddVaultParams = {
      decimalPlaces: 6,
      denom:
        'ibc/B1E6288B5A0224565D915D1F66716486F16D8A44BF33A9EC323DD6BA30764C35',
      keyword: 'STATOM',
      issuerName: 'stATOM',
      proposedName: 'stATOM',
      oracleBrand: 'stATOM',
      oracleAddresses: MAINNET_ORACLE_OPERATORS,
    };
    const [vaultTemplate, oracleTemplate] = [
      resolveAsString('./addVault/add-vault.js'),
      resolveAsString('./addVault/add-oracle.js'),
    ];
    const [expectedVault, expectedOracle] = [
      resolveAsString('./__fixtures__/add-stATOM.js'),
      resolveAsString('./__fixtures__/add-stATOM-oracles.js'),
    ];
    const [generatedVault, generatedOracle] = [
      generateFromTemplate<AddVaultParams>(vaultTemplate, values),
      generateFromTemplate<AddVaultParams>(oracleTemplate, values),
    ];
    expect(generatedVault).toEqual(expectedVault);
    expect(generatedOracle).toEqual(expectedOracle);
  });

  it('should generate code from addVault emerynet template', () => {
    const values: AddVaultParams = {
      decimalPlaces: 6,
      denom:
        'ibc/B1E6288B5A0224565D915D1F66716486F16D8A44BF33A9EC323DD6BA30764C35',
      keyword: 'STATOM',
      issuerName: 'stATOM',
      proposedName: 'stATOM',
      oracleBrand: 'stATOM',
      oracleAddresses: EMERYNET_ORACLE_OPERATORS,
    };
    const [vaultTemplate, oracleTemplate] = [
      resolveAsString('./addVault/add-vault.js'),
      resolveAsString('./addVault/add-oracle.js'),
    ];
    const [expectedVault, expectedOracle] = [
      resolveAsString('./__fixtures__/add-stATOM.js'),
      resolveAsString('./__fixtures__/add-stATOM-oracles-emerynet.js'),
    ];
    const [generatedVault, generatedOracle] = [
      generateFromTemplate<AddVaultParams>(vaultTemplate, values),
      generateFromTemplate<AddVaultParams>(oracleTemplate, values),
    ];
    expect(generatedVault).toEqual(expectedVault);
    expect(generatedOracle).toEqual(expectedOracle);
  });
});
