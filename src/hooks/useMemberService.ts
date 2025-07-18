import { useQuery as useReactQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { MemberService } from '../services/MemberService';
import type { Member } from '../models/member.model';
import { QueryOptions } from '../adapters/base.adapter';
import { NotificationService } from '../services/NotificationService';

export function useMemberService() {
  const service = container.get<MemberService>(TYPES.MemberService);
  const queryClient = useQueryClient();

  const useQuery = (options: QueryOptions = {}) => {
    const { enabled, ...rest } = options;
    const serialized = JSON.stringify(rest);
    return useReactQuery({
      queryKey: ['members', serialized],
      queryFn: () => service.find(options),
      staleTime: 5 * 60 * 1000,
      enabled: enabled ?? true,
    });
  };

  const useQueryAll = (options: Omit<QueryOptions, 'pagination'> = {}) => {
    const { enabled, ...rest } = options;
    const serialized = JSON.stringify(rest);
    return useReactQuery({
      queryKey: ['members', 'all', serialized],
      queryFn: () => service.findAll(options),
      staleTime: 5 * 60 * 1000,
      enabled: enabled ?? true,
    });
  };

  const useFindById = (id: string, options: Omit<QueryOptions, 'pagination'> = {}) => {
    const { enabled, ...rest } = options;
    const serialized = JSON.stringify(rest);
    return useReactQuery({
      queryKey: ['members', id, serialized],
      queryFn: () => service.findById(id, options),
      staleTime: 5 * 60 * 1000,
      enabled: (enabled ?? true) && !!id,
    });
  };

  const useCreate = () =>
    useMutation({
      mutationFn: ({ data, relations, fieldsToRemove }:
        { data: Partial<Member>; relations?: Record<string, any[]>; fieldsToRemove?: string[] }) =>
        service.create(data, relations, fieldsToRemove),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['members'] });
        NotificationService.showSuccess('Member created successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });

  const useUpdate = () =>
    useMutation({
      mutationFn: ({ id, data, relations, fieldsToRemove }:
        { id: string; data: Partial<Member>; relations?: Record<string, any[]>; fieldsToRemove?: string[] }) =>
        service.update(id, data, relations, fieldsToRemove),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['members'] });
        NotificationService.showSuccess('Member updated successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });

  const useDelete = () =>
    useMutation({
      mutationFn: (id: string) => service.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['members'] });
        NotificationService.showSuccess('Member deleted successfully');
      },
      onError: (error: Error) => {
        NotificationService.showError(error.message, 5000);
      },
    });

  return { useQuery, useQueryAll, useFindById, useCreate, useUpdate, useDelete };
}
