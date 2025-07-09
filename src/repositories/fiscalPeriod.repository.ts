import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { FiscalPeriod } from '../models/fiscalPeriod.model';
import type { IFiscalPeriodAdapter } from '../adapters/fiscalPeriod.adapter';

export interface IFiscalPeriodRepository extends BaseRepository<FiscalPeriod> {}

@injectable()
export class FiscalPeriodRepository
  extends BaseRepository<FiscalPeriod>
  implements IFiscalPeriodRepository
{
  constructor(@inject('IFiscalPeriodAdapter') adapter: IFiscalPeriodAdapter) {
    super(adapter);
  }
}
