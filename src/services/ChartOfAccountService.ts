import { injectable, inject } from 'inversify';
import type { IChartOfAccountRepository } from '../repositories/chartOfAccount.repository';
import type { ChartOfAccount } from '../models/chartOfAccount.model';
import type { QueryOptions } from '../adapters/base.adapter';
import { TYPES } from '../lib/types';

@injectable()
export class ChartOfAccountService {
  constructor(
    @inject(TYPES.IChartOfAccountRepository)
    private repository: IChartOfAccountRepository,
  ) {}

  find(options: QueryOptions = {}) {
    return this.repository.find(options);
  }

  findAll(options: Omit<QueryOptions, 'pagination'> = {}) {
    return this.repository.findAll(options);
  }

  findById(id: string, options: Omit<QueryOptions, 'pagination'> = {}) {
    return this.repository.findById(id, options);
  }

  create(
    data: Partial<ChartOfAccount>,
    relations?: Record<string, any[]>,
    fieldsToRemove: string[] = [],
  ) {
    return this.repository.create(data, relations, fieldsToRemove);
  }

  update(
    id: string,
    data: Partial<ChartOfAccount>,
    relations?: Record<string, any[]>,
    fieldsToRemove: string[] = [],
  ) {
    return this.repository.update(id, data, relations, fieldsToRemove);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }

  getHierarchy() {
    return this.repository.getHierarchy();
  }
}
