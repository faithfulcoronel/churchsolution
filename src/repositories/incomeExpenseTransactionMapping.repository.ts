import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { IncomeExpenseTransactionMapping } from '../models/incomeExpenseTransactionMapping.model';
import type { IIncomeExpenseTransactionMappingAdapter } from '../adapters/incomeExpenseTransactionMapping.adapter';
import { NotificationService } from '../services/NotificationService';
import { IncomeExpenseTransactionMappingValidator } from '../validators/incomeExpenseTransactionMapping.validator';

export interface IIncomeExpenseTransactionMappingRepository extends BaseRepository<IncomeExpenseTransactionMapping> {
  getByTransactionId(id: string): Promise<IncomeExpenseTransactionMapping[]>;
}

@injectable()
export class IncomeExpenseTransactionMappingRepository
  extends BaseRepository<IncomeExpenseTransactionMapping>
  implements IIncomeExpenseTransactionMappingRepository {
  constructor(
    @inject('IIncomeExpenseTransactionMappingAdapter')
    adapter: IIncomeExpenseTransactionMappingAdapter
  ) {
    super(adapter);
  }

  protected override async beforeCreate(
    data: Partial<IncomeExpenseTransactionMapping>
  ): Promise<Partial<IncomeExpenseTransactionMapping>> {
    IncomeExpenseTransactionMappingValidator.validate(data);
    return data;
  }

  protected override async afterCreate(
    data: IncomeExpenseTransactionMapping
  ): Promise<void> {
    NotificationService.showSuccess('Mapping created successfully');
  }

  protected override async beforeUpdate(
    id: string,
    data: Partial<IncomeExpenseTransactionMapping>
  ): Promise<Partial<IncomeExpenseTransactionMapping>> {
    IncomeExpenseTransactionMappingValidator.validate(data);
    return data;
  }

  protected override async afterUpdate(
    data: IncomeExpenseTransactionMapping
  ): Promise<void> {
    NotificationService.showSuccess('Mapping updated successfully');
  }

  protected override async afterDelete(id: string): Promise<void> {
    NotificationService.showSuccess('Mapping deleted successfully');
  }

  public async getByTransactionId(
    id: string
  ): Promise<IncomeExpenseTransactionMapping[]> {
    return (
      this.adapter as unknown as IIncomeExpenseTransactionMappingAdapter
    ).getByTransactionId(id);
  }
}
