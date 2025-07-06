import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { MenuPermission } from '../models/menuPermission.model';
import type { IMenuPermissionAdapter } from '../adapters/menuPermission.adapter';
import { TYPES } from '../lib/types';

export interface IMenuPermissionRepository extends BaseRepository<MenuPermission> {}

@injectable()
export class MenuPermissionRepository
  extends BaseRepository<MenuPermission>
  implements IMenuPermissionRepository
{
  constructor(@inject(TYPES.IMenuPermissionAdapter) adapter: IMenuPermissionAdapter) {
    super(adapter);
  }
}
