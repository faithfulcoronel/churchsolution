import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { Role } from '../models/role.model';
import type { IRoleAdapter } from '../adapters/role.adapter';
import { NotificationService } from '../services/NotificationService';
import { RoleValidator } from '../validators/role.validator';

export interface IRoleRepository extends BaseRepository<Role> {}

@injectable()
export class RoleRepository
  extends BaseRepository<Role>
  implements IRoleRepository
{
  constructor(@inject('IRoleAdapter') adapter: IRoleAdapter) {
    super(adapter);
  }

  protected override async beforeCreate(
    data: Partial<Role>
  ): Promise<Partial<Role>> {
    await RoleValidator.validate(data, this);
    return this.formatData(data);
  }

  protected override async afterCreate(data: Role): Promise<void> {
    NotificationService.showSuccess(`Role "${data.name}" created successfully`);
  }

  protected override async beforeUpdate(
    id: string,
    data: Partial<Role>
  ): Promise<Partial<Role>> {
    await RoleValidator.validate(data, this, id);
    return this.formatData(data);
  }

  protected override async afterUpdate(data: Role): Promise<void> {
    NotificationService.showSuccess(`Role "${data.name}" updated successfully`);
  }

  private formatData(data: Partial<Role>): Partial<Role> {
    return {
      ...data,
      name: data.name?.trim().toLowerCase(),
      description: data.description?.trim() || null
    };
  }
}
