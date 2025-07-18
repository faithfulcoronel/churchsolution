import { injectable, inject } from 'inversify';
import { TYPES } from '../lib/types';
import type { IMemberRepository } from '../repositories/member.repository';
import type { Member } from '../models/member.model';
import { QueryOptions } from '../adapters/base.adapter';

@injectable()
export class MemberService {
  constructor(
    @inject(TYPES.IMemberRepository)
    private repo: IMemberRepository,
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
}
