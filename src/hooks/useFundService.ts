import { useQuery as useReactQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { FundService } from '../services/FundService';
import type { Fund } from '../models/fund.model';
import { QueryOptions } from '../adapters/base.adapter';
import { NotificationService } from '../services/NotificationService';

export function useFundService() {
  const service = container.get<FundService>(TYPES.FundService);
  const queryClient = useQueryClient();

  const useQuery = (options: QueryOptions = {}) => {
    const { enabled, ...rest } = options;
    const serializedOptions = JSON.stringify(rest);
    return useReactQuery({
      queryKey: ['funds', serializedOptions],
      queryFn: () => service.find(options),
      staleTime: 5 * 60 * 1000,
      enabled: enabled ?? true,
    });
  };

  const useQueryAll = (options: Omit<QueryOptions, 'pagination'> = {}) => {
    const { enabled, ...rest } = options;
    const serializedOptions = JSON.stringify(rest);
    return useReactQuery({
      queryKey: ['funds', 'all', serializedOptions],
      queryFn: () => service.findAll(options),
      staleTime: 5 * 60 * 1000,
      enabled: enabled ?? true,
    });
  };

  const useFindById = (id: string, options: Omit<QueryOptions, 'pagination'> = {}) => {
    const { enabled, ...rest } = options;
    const serializedOptions = JSON.stringify(rest);
    return useReactQuery({
      queryKey: ['funds', id, serializedOptions],
      queryFn: () => service.findById(id, options),
      staleTime: 5 * 60 * 1000,
      enabled: (enabled ?? true) && !!id,
    });
  };

  const useCreate = () => {
    return useMutation({
      mutationFn: ({ data, relations, fieldsToRemove }:
        { data: Partial<Fund>; relations?: Record<string, any[]>; fieldsToRemove?: string[] }) =>
        service.create(data, relations, fieldsToRemove),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['funds'] });
        NotificationService.showSuccess('Fund created successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });
  };

  const useUpdate = () => {
    return useMutation({
      mutationFn: ({ id, data, relations, fieldsToRemove }:
        { id: string; data: Partial<Fund>; relations?: Record<string, any[]>; fieldsToRemove?: string[] }) =>
        service.update(id, data, relations, fieldsToRemove),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['funds'] });
        NotificationService.showSuccess('Fund updated successfully');
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
        queryClient.invalidateQueries({ queryKey: ['funds'] });
        NotificationService.showSuccess('Fund deleted successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });
  };

  const useBalance = (id: string) => {
    return useReactQuery({
      queryKey: ['fund-balance', id],
      queryFn: () => service.getBalance(id),
      enabled: !!id,
    });
  };

  return { useQuery, useQueryAll, useFindById, useCreate, useUpdate, useDelete, useBalance };
}
