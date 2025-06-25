import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { ErrorLog } from '../models/errorLog.model';
import { TYPES } from '../lib/types';
import type { IErrorLogAdapter } from '../adapters/errorLog.adapter';

export interface IErrorLogRepository extends BaseRepository<ErrorLog> {}

@injectable()
export class ErrorLogRepository
  extends BaseRepository<ErrorLog>
  implements IErrorLogRepository
{
  constructor(@inject(TYPES.IErrorLogAdapter) adapter: IErrorLogAdapter) {
    super(adapter);
  }
}
