import { ChainItem, NetworkConfig } from '../types/chain';
import { capitalize } from './capitalize';

export function getChainItem({
  value,
  ...chain
}: {
  value: string;
  parent?: string;
  enabledProposalTypes: ChainItem['enabledProposalTypes'];
  networks?: NetworkConfig[];
}): ChainItem {
  let parentChainItem: ChainItem | undefined;

  if (chain.parent) {
    parentChainItem = getChainItem({
      value: chain.parent,
      enabledProposalTypes: {}, // Provide appropriate enabledProposalTypes for the parent
      networks: [], // Provide appropriate networks for the parent
    });
  }

  return {
    label: capitalize(value),
    value,
    href: `/${value}`,
    networks: parentChainItem ? parentChainItem.networks : chain.networks,
    ...chain,
  };
}
