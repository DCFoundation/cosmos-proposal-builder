import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import permittedChains from "../data/permittedChains.json" assert { type: "json" };

function generateChains() {
  const chainsImports = permittedChains
    .map(
      (chainName) =>
        `import ${chainName} from '../data/chains/${chainName}.json';`
    )
    .join("\n");

  const chainsExport = `export const CHAINS: ChainItem[] = [${permittedChains.join(
    ", "
  )}].map(getChainItem);`;

  const fileContent = `
import { ChainItem } from '../types/chain';
import { getChainItem } from '../config/chainConfig';

${chainsImports}


${chainsExport}`;

  fs.writeFileSync(
    path.resolve(__dirname, "../constants/chains.ts"),
    fileContent
  );
  //   fs.writeFileSync(
  //     path.resolve(__dirname, "./constants/chains.ts"),
  //     fileContent
  //   );
}

generateChains();
