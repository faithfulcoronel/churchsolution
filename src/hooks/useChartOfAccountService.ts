import { useQuery as useReactQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { QueryOptions } from '../adapters/base.adapter';
import type { ChartOfAccount } from '../models/chartOfAccount.model';
import { ChartOfAccountService } from '../services/ChartOfAccountService';
import { NotificationService } from '../services/NotificationService';

export function useChartOfAccountService() {
  const service = container.get<ChartOfAccountService>(TYPES.ChartOfAccountService);
  const queryClient = useQueryClient();

  const useQuery = (options: QueryOptions = {}) => {
    const { enabled, ...rest } = options;
    const serializedOptions = JSON.stringify(rest);
    return useReactQuery({
      queryKey: ['chart_of_accounts', serializedOptions],
      queryFn: () => service.find(options),
      staleTime: 5 * 60 * 1000,
      enabled: enabled ?? true,
    });
  };

  const useQueryAll = (options: Omit<QueryOptions, 'pagination'> = {}) => {
    const { enabled, ...rest } = options;
    const serializedOptions = JSON.stringify(rest);
    return useReactQuery({
      queryKey: ['chart_of_accounts', 'all', serializedOptions],
      queryFn: () => service.findAll(options),
      staleTime: 5 * 60 * 1000,
      enabled: enabled ?? true,
    });
  };

  const useFindById = (id: string, options: Omit<QueryOptions, 'pagination'> = {}) => {
    const { enabled, ...rest } = options;
    const serializedOptions = JSON.stringify(rest);
    return useReactQuery({
      queryKey: ['chart_of_accounts', id, serializedOptions],
      queryFn: () => service.findById(id, options),
      staleTime: 5 * 60 * 1000,
      enabled: (enabled ?? true) && !!id,
    });
  };

  const useCreate = () => {
    return useMutation({
      mutationFn: ({ data, relations, fieldsToRemove } : { data: Partial<ChartOfAccount>; relations?: Record<string, any[]>; fieldsToRemove?: string[] }) =>
        service.create(data, relations, fieldsToRemove),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chart_of_accounts'] });
        NotificationService.showSuccess('Chart of Account created successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });
  };

  const useUpdate = () => {
    return useMutation({
      mutationFn: ({ id, data, relations, fieldsToRemove } : { id: string; data: Partial<ChartOfAccount>; relations?: Record<string, any[]>; fieldsToRemove?: string[] }) =>
        service.update(id, data, relations, fieldsToRemove),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chart_of_accounts'] });
        NotificationService.showSuccess('Chart of Account updated successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });
  };

  const useDelete = () => {
    return useMutation({
      mutationFn: (id: string) => service.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chart_of_accounts'] });
        NotificationService.showSuccess('Chart of Account deleted successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });
  };

  const getHierarchy = () => service.getHierarchy();

  return {
    useQuery,
    useQueryAll,
    useFindById,
    useCreate,
    useUpdate,
    useDelete,
    getHierarchy,
  };
}
