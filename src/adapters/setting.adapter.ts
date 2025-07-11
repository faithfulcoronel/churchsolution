import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { BaseAdapter } from './base.adapter';
import { Setting } from '../models/setting.model';
import { TYPES } from '../lib/types';
import { AuditService } from '../services/AuditService';

export interface ISettingAdapter extends BaseAdapter<Setting> {}

@injectable()
export class SettingAdapter
  extends BaseAdapter<Setting>
  implements ISettingAdapter
{
  constructor(@inject(TYPES.AuditService) private auditService: AuditService) {
    super();
  }

  protected tableName = 'settings';

  protected defaultSelect = `
    id,
    tenant_id,
    user_id,
    key,
    value,
    created_by,
    updated_by,
    created_at,
    updated_at,
    deleted_at
  `;
}
