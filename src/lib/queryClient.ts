import { QueryClient } from '@tanstack/react-query';
import { handleError } from '../utils/errorHandler';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // React Query v5 uses string literals; "never" disables refetch on focus
      refetchOnWindowFocus: 'never',
      refetchOnReconnect: 'never',
      staleTime: 60 * 60 * 1000, // Data considered fresh for 1 hour
      onError: (error) => handleError(error),
    },
    mutations: {
      onError: (error) => handleError(error),
    },
  },
});
