/**
 * 1. start a mintHolder instance
 *    a. publish displayInfo under boardAux
 * 2. register the resulting issuer with the vbank
 */
// @ts-check
/* global assert, harden */

import { E } from '@endo/far';

const interchainAssetOptions = {
  denom: 'ibc/...',
  decimalPlaces: 6,
  issuerName: 'Asset1',
  proposedName: 'Asset1',
};

/** @template T @typedef {import('@endo/eventual-send').ERef<T>} ERef<T> */
/**
 * @typedef {object} StorageNode
 * @property {(data: string) => Promise<void>} setValue
 * @property {(subPath: string, options?: {sequence?: boolean}) => StorageNode} makeChildNode
 */

export const toCapDataString = x =>
  JSON.stringify({ body: '#' + JSON.stringify(x), slots: [] });

const BOARD_AUX = 'boardAux';
/**
 * Publish Brand displayInfo using boardAux conventions
 *
 * @param {ERef<StorageNode>} chainStorage
 * @param {ERef<import('@agoric/vats').Board>} board
 * @param {Brand} brand
 */
const publishBrandInfo = async (chainStorage, board, brand) => {
  const [boardId, displayInfo] = await Promise.all([
    E(board).getId(brand),
    E(brand).getDisplayInfo(),
  ]);
  const boardAux = E(chainStorage).makeChildNode(BOARD_AUX);
  const node = E(boardAux).makeChildNode(boardId);
  const value = toCapDataString({ displayInfo });
  await E(node).setValue(value);
};

/**
 * based on publishInterchainAssetFromBank
 * https://github.com/Agoric/agoric-sdk/blob/fb940f84636c4ac9c984a593ec4b5a8ae5150039/packages/inter-protocol/src/proposals/addAssetToVault.js
 *
 * @param {*} powers
 */
const execute = async powers => {
  const {
    consume: { chainStorage, board, bankManager, startUpgradable },
    installation: {
      consume: { mintHolder },
    },
    issuer: { produce: produceIssuer },
    brand: { produce: produceBrand },
    instance: { produce: produceInstance },
  } = powers;

  const {
    denom,
    decimalPlaces,
    keyword,
    issuerName = keyword,
    proposedName = keyword,
  } = interchainAssetOptions;

  assert.typeof(denom, 'string');
  assert.typeof(decimalPlaces, 'number');
  assert.typeof(issuerName, 'string');
  assert.typeof(proposedName, 'string');

  const terms = {
    keyword: issuerName, // "keyword" is a misnomer in mintHolder terms
    assetKind: AssetKind.NAT,
    displayInfo: {
      decimalPlaces,
      assetKind: AssetKind.NAT,
    },
  };

  const {
    creatorFacet: mint,
    publicFacet: issuer,
    instance,
  } = await E(startUpgradable)({
    installation: mintHolder,
    label: issuerName,
    privateArgs: undefined,
    terms,
  });

  const brand = await E(issuer).getBrand();
  const kit = { mint, issuer, brand };

  publishBrandInfo(chainStorage, board, brand);
  [produceIssuer, produceBrand, produceInstance].forEach(p =>
    p[issuerName].reset()
  );
  produceIssuer[issuerName].resolve(issuer);
  produceBrand[issuerName].resolve(brand);
  produceInstance[issuerName].resolve(instance);

  await E(bankManager).addAsset(denom, issuerName, proposedName, kit);
};

export const permit = {
  consume: {
    chainStorage: true,
    board: true,
    bankManager: true,
    startUpgradable: true,
  },
  installation: {
    consume: { mintHolder: true },
  },
  issuer: { produce: true },
  brand: { produce: true },
  instance: { produce: true },
};
