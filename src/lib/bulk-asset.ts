#!/bin/env tsx
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { makeFileReader } from './fs.ts';

const nodeRequire = createRequire(import.meta.url);
const asset = {
  registry: nodeRequire.resolve('./chain-registry/README.md'),
};

type Rd = ReturnType<typeof makeFileReader>;

const getJSON = async (rd: Rd) => {
  const txt = await rd.readText();
  return JSON.parse(txt);
};

const getIBCChannels = async (rd: Rd) => {
  const ibc = rd.neighbor('./_IBC/');
  const channels = await ibc.children();
  return { ibc, channels };
};

type ChainInfo = {
  chain_name: string;
  client_id: string;
  connection_id: string;
};

type ChannelInfo = {
  channel_id: string;
  port_id: string;
  client_id?: string;
  connection_id?: string;
};

type ConnectionInfo = {
  ['$schema']: string;
  chain_1: ChainInfo;
  chain_2: ChainInfo;
  channels: Array<{
    chain_1: ChannelInfo;
    chain_2: ChannelInfo;
    ordering: 'ordered' | 'unordered';
    version: string;
    tags?: {
      status?: 'live' | 'upcoming' | 'killed';
      preferred?: boolean;
    };
  }>;
};

const getIBCNeighbors = async (rd: Rd, name: string) => {
  const { ibc, channels } = await getIBCChannels(rd);
  const found = channels.filter(
    ch => ibc.relative(ch.toString()).includes(name) // TODO word boundaries only
  );
  //   console.log(found.map(r => ibc.relative(r.toString())));

  return Promise.all(found.map(ch => getJSON(ch) as Promise<ConnectionInfo>));
};

type InterchainAssetParams = {
  denom: string;
  decimalPlaces: number;
  issuerName: string;
};

const x = () => {
  const p: InterchainAssetParams = {
    decimalPlaces: 6,
    denom: '@@@',
    issuerName: 'whee',
  };
  return p;
};

type DenomUnit = { denom: string; exponent: number };

type AssetT = {
  denom_units: DenomUnit[];
  base: string;
  display: string;
  name: string;
  symbol: string;
  description?: string;
};

type AssetList = {
  chain_name: string;
  assets: AssetT[];
};

export const pprint = (x: unknown) => JSON.stringify(x, null, 2);

const assetInfo = (a: AssetT) => {
  const { symbol: allegedName, denom_units } = a;
  const decimalPlaces = denom_units.find(u => u.denom === a.display)?.exponent;
  const assetKind = typeof decimalPlaces === 'number' ? 'nat' : undefined;
  //   if (decimalPlaces === undefined) console.log('@@@', pprint(a));
  return {
    allegedName,
    assetKind,
    decimalPlaces,
  };
};

const chainInfo = async (rd: Rd, name: string) => {
  const chain = await getJSON(rd.neighbor(`./${name}/chain.json`));
  const assetlist: AssetList = await getJSON(
    rd.neighbor(`./${name}/assetlist.json`)
  );
  return { chain, assetlist };
};

const sha256 = (txt: string) =>
  crypto.createHash('sha256').update(txt).digest('hex');

const main = async (src = 'agoric') => {
  //   console.log('asset paths', asset);
  const rd = makeFileReader(asset.registry, { fs, path }).neighbor('../');
  //   console.log('chain registry rd', `${rd}`);
  //   console.log('chains', `${await rd.children()}`);

  const agChannels = await getIBCNeighbors(rd, src);

  for await (const peer of agChannels) {
    if (peer.chain_1.chain_name !== src) throw Error(pprint(peer));
    const { chain_2, channels } = peer;
    // if (!['osmosis', 'cosmoshub'].includes(chain_2.chain_name)) continue; // XXX
    //   console.log(pprint(chan));
    const other = await chainInfo(rd, chain_2.chain_name);
    for (const chan of channels) {
      const { channel_id, port_id } = chan.chain_1;
      if (port_id !== 'transfer') continue;

      for (const asset of other.assetlist.assets) {
        const info = assetInfo(asset);
        const path = `${port_id}/${channel_id}/${asset.base}`;
        const hash = sha256(path).toUpperCase();
        const denom = `ibc/${hash}`;
        if (info.decimalPlaces === undefined) continue;
        const ia: InterchainAssetParams = {
          decimalPlaces: info.decimalPlaces,
          denom,
          issuerName: asset.symbol,
        };
        console.log(
          `${src}-${channel_id}->${chain_2.chain_name} $${asset.symbol}`,
          path,
          ia
        );
      }
    }
  }
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
