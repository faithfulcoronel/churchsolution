import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { RoleMenuItem } from '../models/roleMenuItem.model';
import type { IRoleMenuItemAdapter } from '../adapters/roleMenuItem.adapter';
import { TYPES } from '../lib/types';

export interface IRoleMenuItemRepository extends BaseRepository<RoleMenuItem> {}

@injectable()
export class RoleMenuItemRepository
  extends BaseRepository<RoleMenuItem>
  implements IRoleMenuItemRepository
{
  constructor(@inject(TYPES.IRoleMenuItemAdapter) adapter: IRoleMenuItemAdapter) {
    super(adapter);
  }
}
