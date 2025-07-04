import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import { NotificationService } from '../services/NotificationService';
import type { SettingService } from '../services/SettingService';

export function useSettingService(key: string) {
  const service = container.get<SettingService>(TYPES.SettingService);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['setting', key],
    queryFn: () => service.getSetting(key),
  });

  const mutation = useMutation({
    mutationFn: (value: string) => service.setSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setting', key] });
      NotificationService.showSuccess('Setting saved');
    },
    onError: (error: Error) => {
      NotificationService.showError(error.message, 5000);
    },
  });

  const updateSetting = async (value: string) => mutation.mutateAsync(value);

  return { query, updateSetting, mutation };
}
