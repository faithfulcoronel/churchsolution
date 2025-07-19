import { injectable, inject } from 'inversify';
import { TYPES } from '../lib/types';
import type { IAccountRepository } from '../repositories/account.repository';
import type { Account } from '../models/account.model';
import type { QueryOptions } from '../adapters/base.adapter';

export interface AccountService {
  getAll(options?: Omit<QueryOptions, 'pagination'>): ReturnType<IAccountRepository['findAll']>;
  getById(id: string, options?: Omit<QueryOptions, 'pagination'>): ReturnType<IAccountRepository['findById']>;
  create(data: Partial<Account>, relations?: Record<string, any[]>, fieldsToRemove?: string[]): Promise<Account>;
  update(id: string, data: Partial<Account>, relations?: Record<string, any[]>, fieldsToRemove?: string[]): Promise<Account>;
  remove(id: string): Promise<void>;
}

@injectable()
export class SupabaseAccountService implements AccountService {
  constructor(
    @inject(TYPES.IAccountRepository)
    private repo: IAccountRepository,
  ) {}

  async getAll(options: Omit<QueryOptions, 'pagination'> = {}) {
    return this.repo.findAll(options);
  }

  async getById(id: string, options: Omit<QueryOptions, 'pagination'> = {}) {
    return this.repo.findById(id, options);
  }

  async create(
    data: Partial<Account>,
    relations?: Record<string, any[]>,
    fieldsToRemove: string[] = [],
  ): Promise<Account> {
    return this.repo.create(data, relations, fieldsToRemove);
  }

  async update(
    id: string,
    data: Partial<Account>,
    relations?: Record<string, any[]>,
    fieldsToRemove: string[] = [],
  ): Promise<Account> {
    return this.repo.update(id, data, relations, fieldsToRemove);
  }

  async remove(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
