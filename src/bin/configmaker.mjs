// index.mjs
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import process from 'process';

import {
  keysToCamelCase,
  selectImageUrl,
} from '../utils/underScoreTocamelCase.mjs';

const RAW_FILE_REPO_URL =
  'https://raw.githubusercontent.com/cosmos/chain-registry';

// Fetch the chain configuration for the specified network type
const fetchChainConfig = async (chainName, networkType) => {
  try {
    const configUrl = `${RAW_FILE_REPO_URL}/master/${
      networkType === 'testnet'
        ? `testnets/${chainName}testnet/chain.json`
        : `${chainName}/chain.json`
    }`;
    const configResponse = await axios.get(configUrl);
    return keysToCamelCase(configResponse.data);
  } catch (error) {
    console.error(
      `Error fetching chain config for ${chainName} (${networkType}):`,
      error
    );
    return null;
  }
};

// Clean up object based on predefined types
const cleanupObject = (obj, type) => {
  if (type === 'ChainItem') {
    return cleanChainItem(obj);
  } else if (type === 'NetworkConfig') {
    return cleanNetworkConfig(obj);
  }
  return obj;
};

const cleanChainItem = (obj) => {
  const chainItem = {
    label: obj.label,
    value: obj.value,
    href: obj.href,
    parent: obj.parent,
    image: obj.image,
    enabledProposalTypes: {
      textProposal: obj.enabledProposalTypes?.textProposal ?? true,
      parameterChangeProposal:
        obj.enabledProposalTypes?.parameterChangeProposal,
      communityPoolSpendProposal:
        obj.enabledProposalTypes?.communityPoolSpendProposal ?? true,
      softwareUpgradeProposal:
        obj.enabledProposalTypes?.softwareUpgradeProposal,
      installBundle: obj.enabledProposalTypes?.installBundle,
      addPSM: obj.enabledProposalTypes?.addPSM,
      addVault: obj.enabledProposalTypes?.addVault,
      coreEvalProposal: obj.enabledProposalTypes?.coreEvalProposal,
    },
    networks: obj.networks
      ? obj.networks.map((network) => cleanNetworkConfig(network))
      : [],
  };
  return chainItem;
};

const cleanNetworkConfig = (obj) => {
  const networkConfig = {
    chainName: obj.chainName,
    chainId: obj.chainId,
    networkName: obj.networkName,
    slip44: obj.slip44,
    fees: obj.fees ? cleanFeeEntry(obj.fees) : undefined,
    bech32Prefix: obj.bech32Prefix,
    apis: obj.apis ? cleanApis(obj.apis) : undefined,
    staking: obj.staking ? cleanStakeCurrencyEntry(obj.staking) : undefined,
    explorers: obj.explorers
      ? obj.explorers.map(cleanExplorerEntry)
      : undefined,
    walletUrl: obj.walletUrl,
    logoURIs: obj.logoURIs,
    images: obj.images,
  };
  return networkConfig;
};

const cleanFeeEntry = (obj) => {
  return {
    feeTokens: obj.feeTokens ? obj.feeTokens.map(cleanFeeToken) : [],
    gasPriceStep: obj.gasPriceStep
      ? cleanGaspPriceStep(obj.gasPriceStep)
      : undefined,
  };
};

const cleanFeeToken = (obj) => {
  return {
    denom: obj.denom,
    fixedMinGasPrice: obj.fixedMinGasPrice,
    lowGasPrice: obj.lowGasPrice,
    averageGasPrice: obj.averageGasPrice,
    highGasPrice: obj.highGasPrice,
  };
};

const cleanGaspPriceStep = (obj) => {
  return {
    fixed: obj.fixed,
    low: obj.low,
    average: obj.average,
    high: obj.high,
  };
};

const cleanStakeCurrencyEntry = (obj) => {
  return {
    stakingTokens: obj.stakingTokens
      ? obj.stakingTokens.map(cleanFeeToken)
      : [],
  };
};

const cleanExplorerEntry = (obj) => {
  return {
    name: obj.name,
    url: obj.url,
    txPage: obj.txPage,
    accountPage: obj.accountPage,
  };
};

const cleanApis = (obj) => {
  return {
    rpc: obj.rpc ? obj.rpc.map(cleanApiEntry) : [],
    rest: obj.rest ? obj.rest.map(cleanApiEntry) : [],
    grpc: obj.grpc ? obj.grpc.map(cleanApiEntry) : [],
  };
};

const cleanApiEntry = (obj) => {
  return {
    address: obj.address,
    provider: obj.provider,
  };
};

const fetchAndCombineConfigs = async (chainName) => {
  const mainnetConfig = await fetchChainConfig(chainName, 'mainnet');
  const testnetConfig = await fetchChainConfig(chainName, 'testnet');

  if (!mainnetConfig && !testnetConfig) {
    console.error(`No configurations found for ${chainName}.`);
    return null;
  }

  const combinedConfig = {
    value: chainName,
    image: null,
    enabledProposalTypes: {
      textProposal: true,
      communityPoolSpendProposal: true,
    },
    networks: [],
  };

  if (mainnetConfig) {
    mainnetConfig.networkName = 'mainnet';
    const cleanedMainnetConfig = cleanupObject(mainnetConfig, 'NetworkConfig');
    combinedConfig.networks.push(cleanedMainnetConfig);
    if (!combinedConfig.image) {
      combinedConfig.image = selectImageUrl(cleanedMainnetConfig);
    }
  }

  if (testnetConfig) {
    testnetConfig.networkName = 'testnet';
    const cleanedTestnetConfig = cleanupObject(testnetConfig, 'NetworkConfig');
    combinedConfig.networks.push(cleanedTestnetConfig);
    if (!combinedConfig.image) {
      combinedConfig.image = selectImageUrl(cleanedTestnetConfig);
    }
  }

  console.log(`Selected image for ${chainName}: ${combinedConfig.image}`);
  return combinedConfig;
};

const isChainConfig = (obj) => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'chainName' in obj &&
    'chainId' in obj &&
    'networkName' in obj &&
    'apis' in obj
  );
};

const downloadChainConfig = async (chainName) => {
  try {
    const chainConfig = await fetchAndCombineConfigs(chainName);
    if (!chainConfig) {
      return;
    }

    const configDir = path.join('src', 'data', 'chains');
    await getOrCreateDir(configDir);
    const configPath = path.join(configDir, `${chainName}.json`);

    if (fs.existsSync(configPath)) {
      const existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (isChainConfig(existingConfig)) {
        console.log(
          `Chain configuration for ${chainName} already exists. Skipping download.`
        );
        return;
      }
    }

    fs.writeFileSync(configPath, JSON.stringify(chainConfig, null, 2));
    console.log(
      `Chain configuration for ${chainName} downloaded and saved successfully.`
    );
  } catch (error) {
    console.error(`Error processing chain ${chainName}:`, error);
  }
};

const getOrCreateDir = async (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const main = async () => {
  try {
    const args = process.argv.slice(2);
    if (args.length === 1) {
      const chainName = args[0];
      await downloadChainConfig(chainName);
    } else {
      console.error('Usage: make <chainName>');
    }
  } catch (error) {
    console.error('Error downloading chain configurations:', error);
  }
};

main().catch(console.error);
