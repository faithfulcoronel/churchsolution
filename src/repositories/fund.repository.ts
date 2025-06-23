import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { Fund } from '../models/fund.model';
import type { IFundAdapter } from '../adapters/fund.adapter';

export interface IFundRepository extends BaseRepository<Fund> {}

@injectable()
export class FundRepository
  extends BaseRepository<Fund>
  implements IFundRepository
{
  constructor(@inject('IFundAdapter') adapter: IFundAdapter) {
    super(adapter);
  }
}
