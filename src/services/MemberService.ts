import { injectable, inject } from 'inversify';
import { format, endOfMonth, endOfWeek, endOfYear, startOfMonth, startOfWeek, startOfYear, subMonths } from 'date-fns';
import { TYPES } from '../lib/types';
import type { IMemberRepository } from '../repositories/member.repository';
import type { IAccountRepository } from '../repositories/account.repository';
import type { IFinancialTransactionRepository } from '../repositories/financialTransaction.repository';
import type { Member } from '../models/member.model';
import { QueryOptions } from '../adapters/base.adapter';

@injectable()
export class MemberService {
  constructor(
    @inject(TYPES.IMemberRepository)
    private repo: IMemberRepository,
    @inject(TYPES.IAccountRepository)
    private accountRepo: IAccountRepository,
    @inject(TYPES.IFinancialTransactionRepository)
    private ftRepo: IFinancialTransactionRepository,
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
    data: Partial<Member>,
    relations?: Record<string, any[]>,
    fieldsToRemove: string[] = [],
  ) {
    return this.repo.create(data, relations, fieldsToRemove);
  }

  update(
    id: string,
    data: Partial<Member>,
    relations?: Record<string, any[]>,
    fieldsToRemove: string[] = [],
  ) {
    return this.repo.update(id, data, relations, fieldsToRemove);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }

  getCurrentMonthBirthdays() {
    return this.repo.getCurrentMonthBirthdays();
  }

  getBirthdaysByMonth(month: number) {
    return this.repo.getBirthdaysByMonth(month);
  }

  private async getAccountId(memberId: string): Promise<string | null> {
    const { data } = await this.accountRepo.findAll({
      select: 'id',
      filters: { member_id: { operator: 'eq', value: memberId } },
    });
    return data?.[0]?.id ?? null;
  }

  async getFinancialTotals(memberId: string) {
    const accountId = await this.getAccountId(memberId);
    if (!accountId) return { year: 0, month: 0, week: 0 };

    const today = new Date();
    const fetchRange = (start: Date, end: Date) =>
      this.ftRepo
        .findAll({
          select: 'debit, credit',
          filters: {
            accounts_account_id: { operator: 'eq', value: accountId },
            type: { operator: 'eq', value: 'income' },
            date: {
              operator: 'between',
              value: format(start, 'yyyy-MM-dd'),
              valueTo: format(end, 'yyyy-MM-dd'),
            },
          },
        })
        .then(r => r.data || []);

    const [yearRes, monthRes, weekRes] = await Promise.all([
      fetchRange(startOfYear(today), endOfYear(today)),
      fetchRange(startOfMonth(today), endOfMonth(today)),
      fetchRange(startOfWeek(today), endOfWeek(today)),
    ]);

    const sum = (rows: any[]) =>
      rows.reduce((s, r) => s + Number(r.debit || 0) - Number(r.credit || 0), 0);

    return { year: sum(yearRes), month: sum(monthRes), week: sum(weekRes) };
  }

  async getFinancialTrends(memberId: string) {
    const accountId = await this.getAccountId(memberId);
    if (!accountId) return [] as { month: string; contributions: number }[];

    const today = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = subMonths(today, i);
      return { start: startOfMonth(d), end: endOfMonth(d), label: format(d, 'MMM yyyy') };
    }).reverse();

    const data = await Promise.all(
      months.map(({ start, end, label }) =>
        this.ftRepo
          .findAll({
            select: 'debit, credit',
            filters: {
              accounts_account_id: { operator: 'eq', value: accountId },
              type: { operator: 'eq', value: 'income' },
              date: {
                operator: 'between',
                value: format(start, 'yyyy-MM-dd'),
                valueTo: format(end, 'yyyy-MM-dd'),
              },
            },
          })
          .then(res => {
            const total = (res.data || []).reduce(
              (s, r) => s + Number(r.debit || 0) - Number(r.credit || 0),
              0,
            );
            return { month: label, contributions: total };
          }),
      ),
    );

    return data;
  }

  async getRecentTransactions(memberId: string, limit = 5) {
    const accountId = await this.getAccountId(memberId);
    if (!accountId) return [];
    const { data } = await this.ftRepo.findAll({
      select:
        'id, date, description, debit, credit, category:category_id(name), fund:fund_id(name, code)',
      filters: {
        accounts_account_id: { operator: 'eq', value: accountId },
        type: { operator: 'eq', value: 'income' },
      },
      order: { column: 'date', ascending: false },
      pagination: { page: 1, pageSize: limit },
    });

    return data || [];
  }
}
