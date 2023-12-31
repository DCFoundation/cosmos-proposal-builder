/**
 * 1. start a mintHolder instance
 *    a. publish displayInfo under boardAux
 * 2. register the resulting issuer with the vbank
 */
// @ts-check
/* global describe, expect, it, harden, Compartment */

import '../installSesLockdown.js';
import { readFile } from 'fs/promises';
import { createRequire } from 'module';
import { makeMarshal } from '@endo/marshal';
import { toCapDataString } from './addInterchainAsset.js';
import {
  hideImportExpr,
  omitExportKewords,
  redactImportDecls,
} from '../utils/module-to-script.js';

const nodeRequire = createRequire(import.meta.url);

const assets = {
  addInterchainAsset: nodeRequire.resolve('./addInterchainAsset.js'),
};

describe('toCapDataString', () => {
  it('agrees with marshal', () => {
    const cases = [
      { decimalPlaces: 6 },
      { assetKind: 'nat' },
      // HAZARD: caller has to sort keys
      { assetKind: 'nat', decimalPlaces: 18 },
    ];
    const m = makeMarshal(undefined, undefined, {
      serializeBodyFormat: 'smallcaps',
    });
    for (const data of cases) {
      harden(data);
      const actual = toCapDataString(data);
      const expected = JSON.stringify(m.toCapData(data));
      expect(actual).toBe(expected);
    }
  });
});

describe('addInterchainAsset.js', () => {
  it('can easily be rendered as a script', async () => {
    const modText = await readFile(assets.addInterchainAsset, 'utf8');
    const script = hideImportExpr(
      omitExportKewords(redactImportDecls(modText))
    );
    const c = new Compartment({ E: () => {}, Far: () => {} });
    expect(() => c.evaluate(script)).not.toThrow();
  });
});
