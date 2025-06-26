import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { IOfferingBatchRepository } from '../repositories/offeringBatch.repository';
import { useBaseRepository } from './useBaseRepository';

export function useOfferingBatchRepository() {
  const repository = container.get<IOfferingBatchRepository>(TYPES.IOfferingBatchRepository);
  return useBaseRepository(repository, 'Offering Batch', 'offering_batches');
}
