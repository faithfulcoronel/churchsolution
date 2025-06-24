import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { User } from '../models/user.model';
import type { IUserAdapter } from '../adapters/user.adapter';
import { UserValidator } from '../validators/user.validator';

export interface IUserRepository extends BaseRepository<User> {}

@injectable()
export class UserRepository
  extends BaseRepository<User>
  implements IUserRepository {
  constructor(@inject('IUserAdapter') adapter: IUserAdapter) {
    super(adapter);
  }

  protected override async beforeCreate(data: Partial<User>): Promise<Partial<User>> {
    UserValidator.validate(data);
    return this.formatUserData(data);
  }

  protected override async beforeUpdate(id: string, data: Partial<User>): Promise<Partial<User>> {
    UserValidator.validate(data);
    return this.formatUserData(data);
  }

  private formatUserData(data: Partial<User>): Partial<User> {
    return {
      ...data,
      email: data.email?.trim().toLowerCase(),
    };
  }
}
