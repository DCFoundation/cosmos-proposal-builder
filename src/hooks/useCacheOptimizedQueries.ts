import {
  NotifyOnChangeProps,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';

/***
 * This hook is a wrapper around useQuery that provides optimized defaults for cache management.
 */
export const useOptimizedQuery = <TQueryFnData, TError, TData = TQueryFnData>(
  queryKey: string[],
  queryFn: () => Promise<TQueryFnData>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchOnReconnect?: boolean;
    refetchOnMount?: boolean;
    notifyOnChangeProps?: NotifyOnChangeProps;
  }
) => {
  return useQuery<TQueryFnData, TError, TData>({
    queryKey,
    queryFn,
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    notifyOnChangeProps: ['data'],
    ...options,
  });
};
export const useOptimizedMutation = <TData, TError, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: TError) => void;
  }
) => {
  return useMutation<TData, TError, TVariables>({
    mutationFn,
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error('Mutation error: ' + error);
      options?.onError?.(error);
    },
    ...options,
  });
};
