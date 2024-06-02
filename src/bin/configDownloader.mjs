// index.mjs
import axios from 'axios';
import fs from 'fs';
import path from 'path';
// import { ChainItem, NetworkConfig } from './types.mjs';
import process from 'process';

const RAW_FILE_REPO_URL =
  'https://raw.githubusercontent.com/cosmos/chain-registry';

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
    fees: cleanFeeEntry(obj.fees),
    bech32Prefix: obj.bech32Prefix,
    apis: obj.apis ? cleanApis(obj.apis) : undefined,
    staking: obj.staking ? cleanStakeCurrencyEntry(obj.staking) : undefined,
    explorers: obj.explorers
      ? obj.explorers.map(cleanExplorerEntry)
      : undefined,
    walletUrl: obj.walletUrl,
  };
  return networkConfig;
};

const cleanFeeEntry = (obj) => {
  return {
    feeTokens: obj.feeTokens.map(cleanFeeToken),
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
    stakingTokens: obj.stakingTokens.map(cleanFeeToken),
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

const fetchChainConfig = async (chainName, networkType) => {
  try {
    const configUrl = `${RAW_FILE_REPO_URL}/master/${
      networkType === 'testnet' ? 'testnets/' : ''
    }${chainName}/chain.json`;

    const configResponse = await axios.get(configUrl);
    const data = configResponse.data;

    let config = typeof data === 'string' ? JSON.parse(data) : data;

    config = await cleanupObject(config, 'ChainItem');
    config.chainName = chainName;
    config.networkName = networkType; // Ensure networkName is set to 'mainnet' or 'testnet'
    config.logoURIs = config.imageUrls;

    return config;
  } catch (error) {
    console.error(`Error fetching chain config for ${chainName}:`, error);
    return null;
  }
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

const downloadChainConfig = async (chainName, networkType) => {
  try {
    const chainConfig = await fetchChainConfig(chainName, networkType);
    if (!chainConfig) {
      return;
    }

    const configDir = path.join(
      'public',
      'chainConfig',
      chainName,
      chainConfig.networkName
    );
    await getOrCreateDir(configDir);
    const configPath = path.join(configDir, '/chain.json');

    if (fs.existsSync(configPath)) {
      const existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (isChainConfig(existingConfig)) {
        console.log(
          `Chain configuration for ${chainName} (${chainConfig.networkName}) already exists. Skipping download.`
        );
        return;
      }
    }

    fs.writeFileSync(configPath, JSON.stringify(chainConfig, null, 2));
    console.log(
      `Chain configuration for ${chainName} (${chainConfig.networkName}) downloaded and saved successfully.`
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
    if (args.length === 2) {
      const chainName = args[0];
      const networkType = args[1];
      await downloadChainConfig(chainName, networkType);
    } else {
      console.error('Usage: make <chainName> <networkType>');
    }
  } catch (error) {
    console.error('Error downloading chain configurations:', error);
  }
};

main().catch(console.error);
