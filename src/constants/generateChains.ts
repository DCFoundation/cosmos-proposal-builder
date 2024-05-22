import fs from "fs";
import path from "path";
import permittedChains from "../data/permittedChains.json";

const generateChains = () => {
  const chainsImports = permittedChains
    .map(
      (chainName: string) =>
        `import ${chainName} from '../data/chains/${chainName}.json';`
    )
    .join("\n");

  const chainsExport = `export const CHAINS :ChainItem[] = [${permittedChains.join(
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
};

generateChains();
