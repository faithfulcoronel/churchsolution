import { useQuery as useReactQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import { FinancialSourceService } from '../services/FinancialSourceService';
import type { FinancialSource } from '../models/financialSource.model';
import type { QueryOptions } from '../adapters/base.adapter';
import { NotificationService } from '../services/NotificationService';

export function useFinancialSourceService() {
  const service = container.get<FinancialSourceService>(TYPES.FinancialSourceService);
  const queryClient = useQueryClient();

  const useQuery = (options: QueryOptions = {}) => {
    const { enabled, ...rest } = options;
    const serializedOptions = JSON.stringify(rest);
    return useReactQuery({
      queryKey: ['financial_sources', serializedOptions],
      queryFn: () => service.find(options),
      staleTime: 5 * 60 * 1000,
      enabled: enabled ?? true,
    });
  };

  const useQueryAll = (options: Omit<QueryOptions, 'pagination'> = {}) => {
    const { enabled, ...rest } = options;
    const serializedOptions = JSON.stringify(rest);
    return useReactQuery({
      queryKey: ['financial_sources', 'all', serializedOptions],
      queryFn: () => service.findAll(options),
      staleTime: 5 * 60 * 1000,
      enabled: enabled ?? true,
    });
  };

  const useFindById = (id: string, options: Omit<QueryOptions, 'pagination'> = {}) => {
    const { enabled, ...rest } = options;
    const serializedOptions = JSON.stringify(rest);
    return useReactQuery({
      queryKey: ['financial_sources', id, serializedOptions],
      queryFn: () => service.findById(id, options),
      staleTime: 5 * 60 * 1000,
      enabled: (enabled ?? true) && !!id,
    });
  };

  const useCreate = () =>
    useMutation({
      mutationFn: ({ data, relations, fieldsToRemove }:
        { data: Partial<FinancialSource>; relations?: Record<string, any[]>; fieldsToRemove?: string[] }) =>
        service.create(data, relations, fieldsToRemove),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['financial_sources'] });
        NotificationService.showSuccess('Financial Source created successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });

  const useUpdate = () =>
    useMutation({
      mutationFn: ({ id, data, relations, fieldsToRemove }:
        { id: string; data: Partial<FinancialSource>; relations?: Record<string, any[]>; fieldsToRemove?: string[] }) =>
        service.update(id, data, relations, fieldsToRemove),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['financial_sources'] });
        NotificationService.showSuccess('Financial Source updated successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });

  const useDelete = () =>
    useMutation({
      mutationFn: (id: string) => service.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['financial_sources'] });
        NotificationService.showSuccess('Financial Source deleted successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });

  return { useQuery, useQueryAll, useFindById, useCreate, useUpdate, useDelete };
}
