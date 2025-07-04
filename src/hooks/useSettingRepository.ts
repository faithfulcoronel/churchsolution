import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { ISettingRepository } from '../repositories/setting.repository';
import { useBaseRepository } from './useBaseRepository';

export function useSettingRepository() {
  const repository = container.get<ISettingRepository>(TYPES.ISettingRepository);
  return useBaseRepository(repository, 'Setting', 'settings');
}
