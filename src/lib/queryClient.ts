import { QueryClient } from '@tanstack/react-query';
import { handleError } from '../utils/errorHandler';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // React Query v5 uses string literals; "never" disables refetch on focus and reconnect
      refetchOnWindowFocus: 'never',
      refetchOnReconnect: 'never',
      staleTime: 15 * 60 * 1000, // Data considered fresh for 15 minutes
      onError: (error) => handleError(error),
    },
    mutations: {
      onError: (error) => handleError(error),
    },
  },
});
