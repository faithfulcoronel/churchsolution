import { injectable, inject } from 'inversify';
import { TYPES } from '../lib/types';
import type { IFundRepository } from '../repositories/fund.repository';
import type { IFundBalanceRepository } from '../repositories/fundBalance.repository';
import type { Fund } from '../models/fund.model';
import { QueryOptions } from '../adapters/base.adapter';

export interface FundService {
  find(options?: QueryOptions): ReturnType<IFundRepository['find']>;
  findAll(options?: Omit<QueryOptions, 'pagination'>): ReturnType<IFundRepository['findAll']>;
  findById(id: string, options?: Omit<QueryOptions, 'pagination'>): ReturnType<IFundRepository['findById']>;
  create(data: Partial<Fund>, relations?: Record<string, any[]>, fieldsToRemove?: string[]): Promise<Fund>;
  update(id: string, data: Partial<Fund>, relations?: Record<string, any[]>, fieldsToRemove?: string[]): Promise<Fund>;
  delete(id: string): Promise<void>;
  getBalance(id: string): Promise<number>;
}

@injectable()
export class DefaultFundService implements FundService {
  constructor(
    @inject(TYPES.IFundRepository) private repo: IFundRepository,
    @inject(TYPES.IFundBalanceRepository) private balanceRepo: IFundBalanceRepository,
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
    data: Partial<Fund>,
    relations?: Record<string, any[]>,
    fieldsToRemove: string[] = [],
  ) {
    return this.repo.create(data, relations, fieldsToRemove);
  }

  update(
    id: string,
    data: Partial<Fund>,
    relations?: Record<string, any[]>,
    fieldsToRemove: string[] = [],
  ) {
    return this.repo.update(id, data, relations, fieldsToRemove);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }

  getBalance(id: string) {
    return this.balanceRepo.getBalance(id);
  }
}
