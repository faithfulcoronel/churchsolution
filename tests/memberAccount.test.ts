import { describe, it, expect } from 'vitest';
import { MemberRepository } from '../src/repositories/member.repository';
import type { IMemberAdapter } from '../src/adapters/member.adapter';
import type { IAccountRepository } from '../src/repositories/account.repository';
import type { Member } from '../src/models/member.model';

class FakeAccountRepository {
  public created: any = null;
  async create(data: any) {
    this.created = data;
    return data;
  }
}

class TestMemberRepository extends MemberRepository {
  public async runAfterCreate(member: Member) {
    // access protected method
    await this.afterCreate(member);
  }
}

describe('member account creation', () => {
  it('creates account with generated account number', async () => {
    const accountRepo = new FakeAccountRepository();
    const repo = new TestMemberRepository({} as IMemberAdapter, accountRepo as unknown as IAccountRepository);

    const member = {
      id: 'abcdef1234567890',
      first_name: 'John',
      last_name: 'Doe'
    } as Member;

    await repo.runAfterCreate(member);

    const accountNumber = `MEM-${member.id.slice(0, 8)}`;
    expect((accountRepo as any).created!.account_number).toBe(accountNumber);
  });
});
