import { useQuery as useReactQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseRepository } from '../repositories/base.repository';
import { BaseModel } from '../models/base.model';
import { QueryOptions } from '../adapters/base.adapter';
import { NotificationService } from '../services/NotificationService';

export function useBaseRepository<T extends BaseModel>(
  repository: BaseRepository<T>,
  resourceName: string,
  queryKey: string
) {
  const queryClient = useQueryClient();

  const useQuery = (options: QueryOptions = {}) => {
    // Serialize query options except for the "enabled" flag to ensure
    // a stable query key across renders. Without this, passing inline
    // objects would create new query keys on every render and trigger
    // unnecessary re-fetching.
    const { enabled, ...rest } = options;
    const serializedOptions = JSON.stringify(rest);
    return useReactQuery({
      queryKey: [queryKey, serializedOptions],
      queryFn: () => repository.find(options),
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: enabled ?? true,
    });
  };

  const useCreate = () => {
    return useMutation({
      mutationFn: ({ data, relations, fieldsToRemove }: 
                   { 
                     data: Partial<T>; 
                     relations?: Record<string, any[]>,
                     fieldsToRemove?: string[]
                   }) => {
        return repository.create(data, relations, fieldsToRemove);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        NotificationService.showSuccess(`${resourceName} created successfully`);
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });
  };

  const useUpdate = () => {
    return useMutation({
      mutationFn: ({ id, data, relations, fieldsToRemove }: 
                   { 
                     id: string; 
                     data: Partial<T>; 
                     relations?: Record<string, any[]>,
                     fieldsToRemove?: string[]
                   }) => {
        return repository.update(id, data, relations, fieldsToRemove);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        NotificationService.showSuccess(`${resourceName} updated successfully`);
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });
  };

  const useDelete = () => {
    return useMutation({
      mutationFn: (id: string) => repository.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        NotificationService.showSuccess(`${resourceName} deleted successfully`);
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });
  };

  return {
    useQuery,
    useCreate,
    useUpdate,
    useDelete,
  };
}