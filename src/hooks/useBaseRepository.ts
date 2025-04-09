import { useQuery as useReactQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseRepository } from '../repositories/base.repository';
import { BaseModel } from '../models/base.model';
import { QueryOptions } from '../adapters/base.adapter';
import { useMessageStore } from '../components/MessageHandler';

export function useBaseRepository<T extends BaseModel>(
  repository: BaseRepository<T>,
  resourceName: string,
  queryKey: string
) {
  const queryClient = useQueryClient();
  const { addMessage } = useMessageStore();

  const useQuery = (options: QueryOptions = {}) => {
    return useReactQuery({
      queryKey: [queryKey, options],
      queryFn: () => repository.find(options),
      staleTime: 5 * 60 * 1000, // 5 minutes
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
        return repository.create(data, relations);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        addMessage({
          type: 'success',
          text: `${resourceName} created successfully`,
          duration: 3000,
        });
      },
      onError: (error: Error) => {
        addMessage({
          type: 'error',
          text: error.message,
          duration: 5000,
        });
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
        addMessage({
          type: 'success',
          text: `${resourceName} updated successfully`,
          duration: 3000,
        });
      },
      onError: (error: Error) => {
        addMessage({
          type: 'error',
          text: error.message,
          duration: 5000,
        });
      },
    });
  };

  const useDelete = () => {
    return useMutation({
      mutationFn: (id: string) => repository.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        addMessage({
          type: 'success',
          text: `${resourceName} deleted successfully`,
          duration: 3000,
        });
      },
      onError: (error: Error) => {
        addMessage({
          type: 'error',
          text: error.message,
          duration: 5000,
        });
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