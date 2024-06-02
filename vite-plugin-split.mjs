import fs from 'fs';
import path from 'path';

export default function jsonSplitPlugin() {
  return {
    name: 'vite-plugin-json-split',
    buildStart() {
      const permittedChainsPath = new URL(
        './src/data/permittedChains.json',
        import.meta.url
      ).pathname;
      const permittedChainsContent = fs.readFileSync(
        permittedChainsPath,
        'utf-8'
      );
      const permittedChains = JSON.parse(permittedChainsContent);

      permittedChains.forEach((chain) => {
        const jsonPath = path.resolve(
          path.dirname(new URL(import.meta.url).pathname),
          `./src/data/chains/${chain}.json`
        );
        const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
        const data = JSON.parse(jsonContent);

        data.networks.forEach((network) => {
          const networkData = {
            ...data,
            networks: [network],
          };

          const networkJsonPath = path.resolve(
            path.dirname(new URL(import.meta.url).pathname),
            `./src/data/split/${chain}-${network.chainId}.json`
          );
          fs.writeFileSync(
            networkJsonPath,
            JSON.stringify(networkData, null, 2)
          );
        });
      });
    },
  };
}
