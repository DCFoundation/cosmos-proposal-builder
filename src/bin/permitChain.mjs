import fs from 'fs';
import path from 'path';
import process from 'process';

const permittedChainsFilePath = path.join(
  'src',
  'data',
  'permittedChains.json'
);

const addToPermittedChains = (chainName) => {
  try {
    const existingChains = fs.existsSync(permittedChainsFilePath)
      ? JSON.parse(fs.readFileSync(permittedChainsFilePath, 'utf8'))
      : [];

    const updatedChains = Array.from(new Set([...existingChains, chainName]));

    fs.writeFileSync(
      permittedChainsFilePath,
      JSON.stringify(updatedChains, null, 2)
    );
    console.log(
      `Successfully added ${chainName} to the permitted chains list.`
    );
  } catch (error) {
    console.error(`Error updating permitted chains file: ${error}`);
  }
};

const main = async () => {
  const chainName = process.env.chain;
  addToPermittedChains(chainName);
};

main().catch(console.error);
