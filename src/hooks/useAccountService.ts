import { useQuery as useReactQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { AccountService } from '../services/AccountService';
import { NotificationService } from '../services/NotificationService';
import { QueryOptions } from '../adapters/base.adapter';

export function useAccountService() {
  const service = container.get<AccountService>(TYPES.AccountService);
  const queryClient = useQueryClient();

  const useQuery = (options: QueryOptions = {}) => {
    const { enabled, ...rest } = options;
    const serializedOptions = JSON.stringify(rest);
    return useReactQuery({
      queryKey: ['accounts', serializedOptions],
      queryFn: () => service.getAll(options),
      staleTime: 5 * 60 * 1000,
      enabled: enabled ?? true,
    });
  };

  const useFindById = (id: string, options: Omit<QueryOptions, 'pagination'> = {}) => {
    const { enabled, ...rest } = options;
    const serializedOptions = JSON.stringify(rest);
    return useReactQuery({
      queryKey: ['accounts', id, serializedOptions],
      queryFn: () => service.getById(id, options),
      staleTime: 5 * 60 * 1000,
      enabled: (enabled ?? true) && !!id,
    });
  };

  const useCreate = () =>
    useMutation({
      mutationFn: ({ data, relations, fieldsToRemove }:
        { data: Parameters<AccountService['create']>[0]; relations?: Record<string, any[]>; fieldsToRemove?: string[] }) =>
        service.create(data, relations, fieldsToRemove),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        NotificationService.showSuccess('Account created successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });

  const useUpdate = () =>
    useMutation({
      mutationFn: ({ id, data, relations, fieldsToRemove }:
        { id: string; data: Parameters<AccountService['update']>[1]; relations?: Record<string, any[]>; fieldsToRemove?: string[] }) =>
        service.update(id, data, relations, fieldsToRemove),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        NotificationService.showSuccess('Account updated successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });

  const useDelete = () =>
    useMutation({
      mutationFn: (id: string) => service.remove(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        NotificationService.showSuccess('Account deleted successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });

  return { useQuery, useFindById, useCreate, useUpdate, useDelete };
}
