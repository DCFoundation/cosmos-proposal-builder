import { UseQueryResult } from '@tanstack/react-query';
import { fetchProposals } from '../lib/fetchProposals';
import { useOptimizedQuery } from './useCacheOptimizedQueries';

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
