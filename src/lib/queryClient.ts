import { QueryClient } from '@tanstack/react-query';
import { handleError } from '../utils/errorHandler';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // React Query v5 uses string literals; "never" disables refetch on focus
      refetchOnWindowFocus: 'never',
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
      onError: (error) => handleError(error),
    },
    mutations: {
      onError: (error) => handleError(error),
    },
  },
});
