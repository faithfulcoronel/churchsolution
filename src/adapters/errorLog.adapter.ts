import 'reflect-metadata';
import { injectable } from 'inversify';
import { BaseAdapter } from './base.adapter';
import { ErrorLog } from '../models/errorLog.model';

export interface IErrorLogAdapter extends BaseAdapter<ErrorLog> {}

@injectable()
export class ErrorLogAdapter
  extends BaseAdapter<ErrorLog>
  implements IErrorLogAdapter
{
  protected tableName = 'error_logs';

  protected defaultSelect = `
    id,
    message,
    stack,
    context,
    created_at,
    tenant_id,
    created_by,
    updated_at,
    updated_by
  `;
}
