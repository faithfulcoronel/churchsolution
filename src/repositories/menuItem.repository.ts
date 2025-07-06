import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { MenuItem } from '../models/menuItem.model';
import type { IMenuItemAdapter } from '../adapters/menuItem.adapter';
import { TYPES } from '../lib/types';

export interface IMenuItemRepository extends BaseRepository<MenuItem> {}

@injectable()
export class MenuItemRepository
  extends BaseRepository<MenuItem>
  implements IMenuItemRepository
{
  constructor(@inject(TYPES.IMenuItemAdapter) adapter: IMenuItemAdapter) {
    super(adapter);
  }
}
