import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { IncomeExpenseTransaction } from '../models/incomeExpenseTransaction.model';
import type { IIncomeExpenseTransactionAdapter } from '../adapters/incomeExpenseTransaction.adapter';
import { NotificationService } from '../services/NotificationService';
import { IncomeExpenseTransactionValidator } from '../validators/incomeExpenseTransaction.validator';

export interface IIncomeExpenseTransactionRepository extends BaseRepository<IncomeExpenseTransaction> {
  getByHeaderId(headerId: string): Promise<IncomeExpenseTransaction[]>;
}

@injectable()
export class IncomeExpenseTransactionRepository
  extends BaseRepository<IncomeExpenseTransaction>
  implements IIncomeExpenseTransactionRepository
{
  constructor(
    @inject('IIncomeExpenseTransactionAdapter') adapter: IIncomeExpenseTransactionAdapter
  ) {
    super(adapter);
  }

  protected override async beforeCreate(
    data: Partial<IncomeExpenseTransaction>
  ): Promise<Partial<IncomeExpenseTransaction>> {
    IncomeExpenseTransactionValidator.validate(data);
    return this.formatData(data);
  }

  protected override async afterCreate(data: IncomeExpenseTransaction): Promise<void> {
    NotificationService.showSuccess('Transaction created successfully');
  }

  protected override async beforeUpdate(
    id: string,
    data: Partial<IncomeExpenseTransaction>
  ): Promise<Partial<IncomeExpenseTransaction>> {
    IncomeExpenseTransactionValidator.validate(data);
    return this.formatData(data);
  }

  protected override async afterUpdate(data: IncomeExpenseTransaction): Promise<void> {
    NotificationService.showSuccess('Transaction updated successfully');
  }

  protected override async afterDelete(id: string): Promise<void> {
    NotificationService.showSuccess('Transaction deleted successfully');
  }

  private formatData(
    data: Partial<IncomeExpenseTransaction>
  ): Partial<IncomeExpenseTransaction> {
    const formatted = { ...data };
    if (formatted.description) {
      formatted.description = formatted.description.trim();
    }
    if (formatted.reference) {
      formatted.reference = formatted.reference.trim();
    }
    return formatted;
  }

  public async getByHeaderId(headerId: string): Promise<IncomeExpenseTransaction[]> {
    return (
      this.adapter as unknown as IIncomeExpenseTransactionAdapter
    ).getByHeaderId(headerId);
  }
}
