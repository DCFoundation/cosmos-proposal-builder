import axios from 'axios';
import fs from 'fs';
import path from 'path';

/**
 * TODO: have a way to capture logo_urls by name(name suggested by the maintainer of chain
 * eg logo_name = 'agoric-main.png or agoric-main.svg' logos will be a pointer to already existing images
 *   - if the image does not exist, download it from the chain-registry repo
 * 
 */


const GIT_REF = '350840e766f7574a120760a13eda4c466413308a';
const RAW_FILE_REPO_URL = 'https://raw.githubusercontent.com/cosmos/chain-registry';
const REPO_URL = 'https://api.github.com/repos/cosmos/chain-registry/contents';
type ApiEntry = {
    address: string;
    provider?: string;
  };
  
  type Apis = {
    rpc: ApiEntry[];
    rest: ApiEntry[];
    grpc: ApiEntry[];
  };

interface ChainConfig {
  chain_name: string;
  chain_id: string;
  network_type: string;
  apis: Apis;
  logo_URIs?: string[];
  //TODO: Add other properties if necessary
}

const cleanupObject = (obj: any): ChainConfig => {
    // If type is right, do norhing
    if (isChainConfig(obj)) {
      return obj;
    }
  
    const cleanedObj: any = {};
  
    // Clean up and convert properties from downloaded JSON object
    cleanedObj.chain_name = obj.chain_name;
    cleanedObj.chain_id = obj.chain_id;
    cleanedObj.network_type = obj.network_type;
    cleanedObj.apis = {
      rpc: obj.apis.rpc.map((entry: any) => ({
        address: entry.address,
        provider: entry.provider,
      })),
      rest: obj.apis.rest.map((entry: any) => ({
        address: entry.address,
        provider: entry.provider,
      })),
      grpc: obj.apis.grpc.map((entry: any) => ({
        address: entry.address,
        provider: entry.provider,
      })),
    };  
    return cleanedObj as ChainConfig;
  };
  
  const isChainConfig = (obj: any): obj is ChainConfig => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'chain_name' in obj &&
      'chain_id' in obj &&
      'network_type' in obj &&
      'apis' in obj
    );
  };
const dw = async (url: string): Promise<any> => {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': `ocular/${process.env.npm_package_version}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data from URL:', url);
      console.error('Error details:', error);
      throw error;
    }
  };

  //TODO: read these from a josn file - approved.json
  //maintained by dcf - fetch from github repo
  const fetchApprovedChains = async (): Promise<string[]> => {
    return ['agoric', 'cosmoshub', 'osmosis', 'juno'];
}


const fetchChainConfig = async (chainName: string): Promise<ChainConfig> => {
    const url = `${RAW_FILE_REPO_URL}/${GIT_REF}/${chainName}/chain.json`;
    const data: string | object = await dw(url);
  
    let config: ChainConfig;
  
    if (typeof data === 'string') {
      config = JSON.parse(data);
    } else {
      config = cleanupObject(data);
    }
    // to replace this with a better way to get the logo urls
    config.logo_URIs = [`/public/logo/${chainName}.svg`, `/public/logo/${chainName}.png`];
    return config;
  };
  
const downloadAsset = async (chainName: string, assetName: string): Promise<void> => {
  const assetUrl = `${RAW_FILE_REPO_URL}/${GIT_REF}/${chainName}/images/${assetName}`;
  const response = await axios.get(assetUrl, { responseType: 'stream' });

  const assetDir = path.join('public', chainName);
  if (!fs.existsSync(assetDir)) {
    fs.mkdirSync(assetDir, { recursive: true });
  }

  const assetPath = path.join(assetDir, assetName);
  const writer = fs.createWriteStream(assetPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

const downloadImage = async (url: string, outputPath: string): Promise<void> => {
    const response = await axios.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
  
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  };



const fetchChainImages = async (chainName: string): Promise<string[]> => {
    const url = `${REPO_URL}/${chainName}/images`;
    const response = await axios.get(url);
    const data = response.data;
  
    return data
      .filter((file: any) => file.type === 'file' && (file.name.endsWith('.png') || file.name.endsWith('.svg')))
      .map((file: any) => file.download_url);
  };


const downloadApprovedChainConfigs = async (): Promise<void> => {
    const approvedChains = await fetchApprovedChains();
  
    for (const chainName of approvedChains) {
      try {
        const chainConfig = await fetchChainConfig(chainName);
  
        const configDir = path.join('config', chainName);
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }
  
        const configPath = path.join(configDir, 'chain.json');
        fs.writeFileSync(configPath, JSON.stringify(chainConfig, null, 2));
  
        console.log(`Chain configuration for ${chainName} downloaded and saved successfully.`);
  
        const imageUrls = await fetchChainImages(chainName);
        const assetDir = path.join('public', chainName);
  
        if (!fs.existsSync(assetDir)) {
          fs.mkdirSync(assetDir, { recursive: true });
        }
  
        const downloadPromises = imageUrls.map(async (imageUrl) => {
          const imageName = path.basename(imageUrl);
          const outputPath = path.join(assetDir, imageName);
  
          await downloadImage(imageUrl, outputPath);
          console.log(`Image ${imageName} for ${chainName} downloaded successfully.`);
        });
  
        await Promise.all(downloadPromises);
      } catch (error) {
        console.error(`Error processing chain ${chainName}:`, error);
      }
    }
  };
const main = async () => {
  try {
    await downloadApprovedChainConfigs();
    console.log('Approved chain configurations and assets downloaded successfully.');
  } catch (error) {
    console.error('Error downloading chain configurations:', error);
  }
};

main().catch(console.error);
