import { QueryClient } from '@tanstack/react-query';
import { handleError } from '../utils/errorHandler';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
      onError: (error) => handleError(error),
    },
    mutations: {
      onError: (error) => handleError(error),
    },
  },
});
