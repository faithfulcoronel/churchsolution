import { describe, it, expect } from 'vitest';
import { UserRepository } from '../src/repositories/user.repository';
import type { IAuthUserAdapter } from '../src/adapters/authUser.adapter';
import type { User } from '../src/models/user.model';

class TestUserRepository extends UserRepository {
  public async runBeforeUpdate(id: string, data: Partial<User>) {
    // @ts-ignore access protected
    return this.beforeUpdate(id, data);
  }
}

describe('UserRepository validation', () => {
  it('allows updating with empty password', async () => {
    const repo = new TestUserRepository({} as IAuthUserAdapter);
    const data = await repo.runBeforeUpdate('1', {
      email: 'TEST@EXAMPLE.COM',
      password: '',
    });
    expect(data).toEqual({ email: 'test@example.com', password: '' });
  });
});
