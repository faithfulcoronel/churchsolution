import { injectable, inject } from 'inversify';
import { TYPES } from '../lib/types';
import type { IAccountRepository } from '../repositories/account.repository';
import type { Account } from '../models/account.model';
import type { QueryOptions } from '../adapters/base.adapter';

export interface AccountService {
  getAll(options?: Omit<QueryOptions, 'pagination'>): Promise<Account[]>;
  getById(id: string, options?: Omit<QueryOptions, 'pagination'>): Promise<Account | null>;
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

  async getAll(options: Omit<QueryOptions, 'pagination'> = {}): Promise<Account[]> {
    const { data } = await this.repo.findAll(options);
    return data ?? [];
  }

  async getById(id: string, options: Omit<QueryOptions, 'pagination'> = {}): Promise<Account | null> {
    const { data } = await this.repo.findById(id, options);
    return data ?? null;
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
