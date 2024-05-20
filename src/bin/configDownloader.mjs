import axios from "axios";
import fs from "fs";
import path from "path";

const GIT_REF = "350840e766f7574a120760a13eda4c466413308a";
const RAW_FILE_REPO_URL =
  "https://raw.githubusercontent.com/gacogo/chain-registry";
const REPO_URL = "https://api.github.com/repos/gacogo/chain-registry/contents";

const cleanupObject = async (obj) => {
  // If it's of the config type, do nothing
  if (await isChainConfig(obj)) {
    console.log(" we good gucci");
    return obj;
  }

  const cleanedObj = {};

  const keys = Object.keys(obj);

  // Clean up and convert properties from downloaded JSON object
  for (const key of keys) {
    const camelCaseKey = toCamelCase(key);
    if (camelCaseKey === "networkType") {
      // Special case for networkName
      cleanedObj.networkName = obj[key];
    } else if (camelCaseKey === "compatibleVersions") {
      // Special case for compatibleVersions
      cleanedObj.compatibleVersions = obj[key];
    } else if (camelCaseKey === "keyAlgos") {
      // Special case for keyAlgos
      cleanedObj.keyAlgos = obj[key];
    } else if (Array.isArray(obj[key])) {
      cleanedObj[camelCaseKey] = obj[key].map((entry) => {
        const camelCaseEntry = {};
        const entryKeys = Object.keys(entry);
        for (const entryKey of entryKeys) {
          const camelCaseEntryKey = toCamelCase(entryKey);
          camelCaseEntry[camelCaseEntryKey] = entry[entryKey];
        }
        return camelCaseEntry;
      });
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      cleanedObj[camelCaseKey] = await cleanupObject(obj[key]);
    } else {
      cleanedObj[camelCaseKey] = obj[key];
    //   continue;
    }
  }
  console.log("cleanedObj", cleanedObj);
  return cleanedObj;
};

const toCamelCase = (str) => {
  return str.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
};

const isChainConfig = async (obj) => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "chainName" in obj &&
    "chainId" in obj &&
    "networkName" in obj &&
    "apis" in obj
  );
};

const dw = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": `ocular/${process.env.npm_package_version}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data from URL:", url);
    console.error("Error details:", error);
    throw error;
  }
};

//TODO: read these from a josn file - approved.json
//maintained by dcf - fetch from github repo
const fetchApprovedChains = async () => {
  return ["agoric", "cosmoshub", "osmosis", "juno", "celestia"];
};

const fetchChainConfig = async (chainName, networkType) => {
  try {
    const networkName = networkType === 'testnet' ? `${chainName}testnet` : chainName;
    const configUrl = networkType === "testnet"
      ? `${RAW_FILE_REPO_URL}/master/testnets/${networkName}/chain.json`
      : `${RAW_FILE_REPO_URL}/master/${chainName}/chain.json`;

    const configResponse = await axios.get(configUrl);
    const data = configResponse.data;

    let config;
    if (typeof data === "string") {
      config = JSON.parse(data);
    } else {
      config = data;
    }

    // Convert the config object to camelCase
    config = await cleanupObject(config);
    // config.networkName = networkName;
    // Set the chainName from the command-line argument
    config.chainName = chainName;
    console.error(' we have images? ', config.images)
    // Set the logo URLs
    config.logoURIs = config.imageUrls;
    // console.log("config ixxxx ", config);
    return config;
  } catch (error) {
    console.error(`Error fetching chain config for ${chainName}:`, error);
    return null;
  }
};
const downloadChainConfig = async (chainName, networkName) => {
  try {
    // const networkName = isTestnet ? `${chainName}testnet` : "mainnet";
    const chainConfig = await fetchChainConfig(chainName, networkName);
    console.log(" We have something   ", chainConfig);
    
    const configDir = path.join(
      "public",
      "chainConfig",
      chainName,
      chainConfig.networkName
    );
    //console.log(` configDir ${configDir} \n\ chainConfig ${chainConfig.networkName} \n\n`);
    console.log("Creating folder as ", configDir);
    await getOrCreatedir(configDir);
    const configPath = path.join(configDir, "/chain.json");
    console.log("config fir ", configPath);
    // Check if the JSON file already exists and has the expected structure
    if (fs.existsSync(configPath)) {
      const existingConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (await isChainConfig(existingConfig)) {
        console.log(
          `Chain configuration for ${chainName} (${chainConfig.networkName}) already exists and has the expected structure. Skipping download.`
        );
        return;
      }
    }

    fs.writeFileSync(configPath, JSON.stringify(chainConfig, null, 2));

    console.log(
      `Chain configuration for ${chainName} (${chainConfig.networkName}) downloaded and saved successfully.`
    );

    // //   const imageUrls = await fetchChainImages(chainName);
    //   const assetDir = path.join("public", chainName);

    //   await getOrCreatedir(assetDir);
  } catch (error) {
    console.error(`Error processing chain ${chainName}:`, error);
  }
};

const getOrCreatedir = async (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};


// const fetchChainImages = async (chainName) => {
//     const chainConfig =  await import(`../chainConfig/${chainName}/mainnet/chain.json`);
//     const logoUrls = chainConfig.images;
//     if (logoUrls) {
//         return [logoUrls]
//     }
//     // const downloadPromises = chainImages.map( async (imageUrl) =>
//     return null;
// }
//   const url = `${REPO_URL}/${chainName}/images`;
//   const response = await axios.get(url);
//   const data = response.data;

//   return data
//     .filter(
//       (file) =>
//         file.type === "file" &&
//         (file.name.endsWith(".png") || file.name.endsWith(".svg"))
//     )
//     .map((file) => file.download_url);
// };

const downloadApprovedChainConfigs = async () => {
  const approvedChains = await fetchApprovedChains();

  for (const chainName of approvedChains) {
    try {
      const chainConfig = await fetchChainConfig(chainName);

      //if chain config not valid return
      if (!chainConfig) {
        console.error(`Skipping chain ${chainName} due to invalid config.`);
        continue;
      }
      // Check for undefined values
      if (!chainName || !chainConfig.networkName) {
        console.error(
          `Error: chainName or networkName is undefined for chain ${chainName}`
        );
        continue;
      }

      const configDir = path.join("public", "chainConfig", chainName, chainConfig.networkName);

      await getOrCreatedir(configDir);

      const configPath = path.join(configDir, `/chain.json`);
      fs.writeFileSync(configPath, JSON.stringify(chainConfig, null, 2));
      console.log(
        `Chain configuration for ${chainName} downloaded and saved successfully.`
      );
    //   let imageUrls
    //   let downloadPromises;
    //   const assetDir = path.join("logo");
    //   await getOrCreatedir(assetDir);
      //const chainImages = chainConfig.images
        // if (chainImages){
        //   downloadPromises = chainImages.map( async (imageUrl) =>
        // {
        //     const imageName = path.basename(imageUrl);
        //     const outputPath = path.join(assetDir, ``)
        // })
        // }
        //const imageUrls = await fetchChainImages(chainName);
    


        // downloadPromises = imageUrls.map(async (imageUrl) => {
        // const imageName = path.basename(imageUrl);
        // const outputPath = path.join(assetDir, imageName);

    //     await downloadImage(imageUrl, outputPath);
    //     console.log(
    //       `Image ${imageName} for ${chainName} downloaded successfully.`
    //     );
    //   });

      //await Promise.all(downloadPromises);
    } catch (error) {
      console.error(`Error processingGGG chain ${chainName}:`, error);
    }
  }
};

// const downloadChainConfig = async (chainName, isTestnet) => {
//     try {
//       const networkName = isTestnet ?  `${chainName}testnet` : chainName;
//       const configUrl = isTestnet
//         ? `${RAW_FILE_REPO_URL}/${GIT_REF}/testnets/${networkName}/chain.json`
//         : `${RAW_FILE_REPO_URL}/${GIT_REF}/${networkName}/chain.json`;

//       const configResponse = await axios.get(configUrl);
//       const chainConfig = configResponse.data;

//       if (!validateChainConfig(chainConfig)) {
//         console.error(`Skipping chain ${chainName} due to invalid config.`);
//         return;
//       }

//       const configDir = path.join("config", chainName, networkName);
//       const configPath = path.join(configDir, "chain.json");

//       // Check if the JSON file already exists and has the expected structure
//       if (fs.existsSync(configPath)) {
//         const existingConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
//         if (validateChainConfig(existingConfig)) {
//           console.log(
//             `Chain configuration for ${chainName} (${networkName}) already exists and has the expected structure. Skipping download.`,
//           );
//           return;
//         }
//       }

//       await getOrCreatedir(configDir);
//       fs.writeFileSync(configPath, JSON.stringify(chainConfig, null, 2));

//       console.log(
//         `Chain configuration for ${chainName} (${networkName}) downloaded and saved successfully.`,
//       );

//       const imageUrls = await fetchChainImages(chainName);
//       const assetDir = path.join("public", chainName);

//       await getOrCreatedir(assetDir);

//       const downloadPromises = imageUrls.map(async (imageUrl) => {
//         const imageName = path.basename(imageUrl);
//         const outputPath = path.join(assetDir, imageName);

//         // Check if the asset file already exists
//         if (!fs.existsSync(outputPath)) {
//           await downloadImage(imageUrl, outputPath);
//           console.log(
//             `Image ${imageName} for ${chainName} downloaded successfully.`,
//           );
//         } else {
//           console.log(

//             `Image ${imageName} for ${chainName} already exists. Skipping download.`,
//           );
//         }
//       });

//       await Promise.all(downloadPromises);
//     } catch (error) {
//       console.error(`Error processing chain ${chainName}:`, error);
//     }
//   };
// const downloadChainConfig = async (chainName, isTestnet) => {

//     try {
//         const networkName = isTestnet ? `${chainName}testnet` : chainConfig.networkName;
//         const configDir = path.join("config", chainName, networkName);

//         const configPath = path.join(configDir, "chain.json");
//         if (fs.existsSync(configPath)) {
//           const existingConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
//           if (validateChainConfig(existingConfig)) {
//             console.log(
//               `Chain configuration for ${chainName} (${networkName}) already exists and has the expected structure. Skipping download.`,
//             );
//             return;
//           }
//           }
//     await getOrCreatedir(configDir);
//       const chainConfig = await fetchChainConfig(chainName, isTestnet);

//       if (!chainConfig) {
//         console.error(`Skipping chain ${chainName} due to invalid config.`);
//         return;
//       }

//       fs.writeFileSync(configPath, JSON.stringify(chainConfig, null, 2));

//       console.log(
//         `Chain configuration for ${chainName} (${networkName}) downloaded and saved successfully.`,
//       );

//       const imageUrls = await fetchChainImages(chainName);
//       const assetDir = path.join("public", chainName);

//       await getOrCreatedir(assetDir);

//       const downloadPromises = imageUrls.map(async (imageUrl) => {
//         const imageName = path.basename(imageUrl);
//         const outputPath = path.join(assetDir, imageName);

//         // Check if the asset file already exists
//         if (!fs.existsSync(outputPath)) {
//           await downloadImage(imageUrl, outputPath);
//           console.log(
//             `Image ${imageName} for ${chainName} downloaded successfully.`,
//           );
//         } else {
//           console.log(
//             `Image ${imageName} for ${chainName} already exists. Skipping download.`,
//           );
//         }
//       });

//       await Promise.all(downloadPromises);
//     } catch (error) {
//       console.error(`Error processing chain ${chainName}:`, error);
//     }
//   };
// const downloadChainConfig = async (chainName, isTestnet) => {
//     try {
//       const chainConfig = await fetchChainConfig(chainName, isTestnet);

//       if (!chainConfig) {
//         console.error(`Skipping chain ${chainName} due to invalid config.`);
//         return;
//       }

//       const networkName = isTestnet ? `${chainName}testnet` : chainConfig.networkName;
//       const configDir = path.join("config", chainName, networkName);

//       await getOrCreatedir(configDir);

//       const configPath = path.join(configDir, "chain.json");
//       fs.writeFileSync(configPath, JSON.stringify(chainConfig, null, 2));

//       console.log(
//         `Chain configuration for ${chainName} (${networkName}) downloaded and saved successfully.`,
//       );

//       const imageUrls = await fetchChainImages(chainName);
//       const assetDir = path.join("public", chainName);

//       await getOrCreatedir(assetDir);

//       const downloadPromises = imageUrls.map(async (imageUrl) => {
//         const imageName = path.basename(imageUrl);
//         const outputPath = path.join(assetDir, imageName);

//         await downloadImage(imageUrl, outputPath);
//         console.log(
//           `Image ${imageName} for ${chainName} downloaded successfully.`,
//         );
//       });

//       await Promise.all(downloadPromises);
//     } catch (error) {
//       console.error(`Error processing chain ${chainName}:`, error);
//     }
//   };
const main = async () => {
  try {
    const args = process.argv.slice(2);
    if (args.length === 2) {
      const chainName = args[0];
      const networkType = args[1];
      console.warn(' chainName is ', chainName);
      console.warn('networkType  nayo ni', networkType);
      // const isTestnet = networkType === "testnet";
      await downloadChainConfig(chainName, networkType);
      console.log(" We passed aomeyfof");
    } else {
      await downloadApprovedChainConfigs();
    }
    console.log("Chain configurations and assets downloaded successfully.");
  } catch (error) {
    console.error("Error downloading chain configurations:", error);
  }
};
main().catch(console.error);
