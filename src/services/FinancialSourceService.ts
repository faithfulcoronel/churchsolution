import { injectable, inject } from 'inversify';
import { TYPES } from '../lib/types';
import type { IFinancialSourceRepository } from '../repositories/financialSource.repository';
import type { FinancialSource } from '../models/financialSource.model';
import type { QueryOptions } from '../adapters/base.adapter';

@injectable()
export class FinancialSourceService {
  constructor(
    @inject(TYPES.IFinancialSourceRepository)
    private repo: IFinancialSourceRepository,
  ) {}

  find(options: QueryOptions = {}) {
    return this.repo.find(options);
  }

  findAll(options: Omit<QueryOptions, 'pagination'> = {}) {
    return this.repo.findAll(options);
  }

  findById(id: string, options: Omit<QueryOptions, 'pagination'> = {}) {
    return this.repo.findById(id, options);
  }

  create(
    data: Partial<FinancialSource>,
    relations?: Record<string, any[]>,
    fieldsToRemove: string[] = [],
  ) {
    return this.repo.create(data, relations, fieldsToRemove);
  }

  update(
    id: string,
    data: Partial<FinancialSource>,
    relations?: Record<string, any[]>,
    fieldsToRemove: string[] = [],
  ) {
    return this.repo.update(id, data, relations, fieldsToRemove);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}
