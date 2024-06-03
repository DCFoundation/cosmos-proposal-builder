import { UseQueryResult } from '@tanstack/react-query';
import { fetchProposals } from '../lib/fetchProposals';
import { useOptimizedQuery } from './useCacheOptimizedQueries';
import { useMemo } from 'react';
import { ChainItem } from '../types/chain';

export const usePermittedProposals = (currentChainItem: ChainItem | null) => {
  return useMemo(() => {
    if (!currentChainItem) return null;
    return Object.entries(currentChainItem.enabledProposalTypes)
      .filter(([_, value]) => value)
      .map(([key]) => key) as QueryParams['msgType'][];
  }, [currentChainItem]);
};

export const useProposals = (
  permittedProposals: QueryParams['msgType'][]
): UseQueryResult<
  {
    title: string;
    msgType: QueryParams['msgType'];
    description: React.ReactNode;
    governanceForumLink: string;
  }[]
> => {
  return useOptimizedQuery(
    ['proposals', ...permittedProposals],
    () => fetchProposals(permittedProposals),
    { enabled: permittedProposals.length > 0 }
  );
};
