import { readFileSync } from "fs";
import { createRequire } from "module";
import { generateFromTemplate } from "./generateFromTemplate";

const myRequire = createRequire(import.meta.url);

describe("proposal builders - generateFromTemplate", () => {
  it("should generate code from addPsm template", () => {
    const values: AddPSMParams = {
      decimalPlaces: 6,
      keyword: "USDC",
      proposedName: "USDC",
      denom:
        "ibc/FE98AAD68F02F03565E9FA39A5E627946699B2B07115889ED812D8BA639576A9",
    };
    const template = readFileSync(
      myRequire.resolve("./addPSM/gov-start-psm.js"),
      "utf8"
    );
    const expectedCode = readFileSync(
      myRequire.resolve("./__fixtures__/gov-start-usdc-psm.js"),
      "utf8"
    );
    const generatedCode = generateFromTemplate<AddPSMParams>(template, values);
    expect(generatedCode).toEqual(expectedCode);
  });

  it("should generate code from addVault template", () => {
    const values: AddVaultParams = {
      decimalPlaces: 6,
      denom:
        "ibc/B1E6288B5A0224565D915D1F66716486F16D8A44BF33A9EC323DD6BA30764C35",
      keyword: "STATOM",
      issuerName: "stATOM",
      proposedName: "stATOM",
      oracleBrand: "stATOM",
    };
    const [vaultTemplate, oracleTemplate] = [
      readFileSync(myRequire.resolve("./addVault/add-vault.js"), "utf8"),
      readFileSync(myRequire.resolve("./addVault/add-oracle.js"), "utf8"),
    ];
    const [expectedVault, expectedOracle] = [
      readFileSync(myRequire.resolve("./__fixtures__/add-stATOM.js"), "utf8"),
      readFileSync(
        myRequire.resolve("./__fixtures__/add-stATOM-oracles.js"),
        "utf8"
      ),
    ];
    const [generatedVault, generatedOracle] = [
      generateFromTemplate<AddVaultParams>(vaultTemplate, values),
      generateFromTemplate<AddVaultParams>(oracleTemplate, values),
    ];
    expect(generatedVault).toEqual(expectedVault);
    expect(generatedOracle).toEqual(expectedOracle);
  });
});
