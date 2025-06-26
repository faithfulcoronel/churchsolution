import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IErrorLogRepository } from '../repositories/errorLog.repository';
import { useBaseRepository } from './useBaseRepository';

export function useErrorLogRepository() {
  const repository = container.get<IErrorLogRepository>(TYPES.IErrorLogRepository);
  return useBaseRepository(repository, 'Error Log', 'error_logs');
}
