import { Role } from '../models/role.model';

export class RoleValidator {
  static validate(data: Partial<Role>): void {
    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('Role name is required');
    }
  }
}
