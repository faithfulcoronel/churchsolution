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

  const useCurrentMonthBirthdays = () =>
    useReactQuery({
      queryKey: ['members', 'birthdays', 'current-month'],
      queryFn: () => service.getCurrentMonthBirthdays(),
      staleTime: 5 * 60 * 1000,
    });

  const useBirthdaysByMonth = (month: number) =>
    useReactQuery({
      queryKey: ['members', 'birthdays', month],
      queryFn: () => service.getBirthdaysByMonth(month),
      staleTime: 5 * 60 * 1000,
      enabled: month >= 1 && month <= 12,
    });

  const useFinancialTotals = (memberId: string) =>
    useReactQuery({
      queryKey: ['member-financial-totals', memberId],
      queryFn: () => service.getFinancialTotals(memberId),
      staleTime: 5 * 60 * 1000,
      enabled: !!memberId,
    });

  const useFinancialTrends = (
    memberId: string,
    range: 'current' | 'thisYear' | 'lastYear' = 'current',
  ) =>
    useReactQuery({
      queryKey: ['member-financial-trends', memberId, range],
      queryFn: () => service.getFinancialTrends(memberId, range),
      staleTime: 5 * 60 * 1000,
      enabled: !!memberId,
    });

  const useRecentTransactions = (memberId: string) =>
    useReactQuery({
      queryKey: ['member-recent-transactions', memberId],
      queryFn: () => service.getRecentTransactions(memberId),
      staleTime: 5 * 60 * 1000,
      enabled: !!memberId,
    });

  return {
    useQuery,
    useQueryAll,
    useFindById,
    useCreate,
    useUpdate,
    useDelete,
    useCurrentMonthBirthdays,
    useBirthdaysByMonth,
    useFinancialTotals,
    useFinancialTrends,
    useRecentTransactions,
  };
}
