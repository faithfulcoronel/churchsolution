import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { FinancialTransaction } from '../models/financialTransaction.model';
import type { IFinancialTransactionAdapter } from '../adapters/financialTransaction.adapter';
import { NotificationService } from '../services/NotificationService';
import { FinancialTransactionValidator } from '../validators/financialTransaction.validator';

export interface IFinancialTransactionRepository extends BaseRepository<FinancialTransaction> {}

@injectable()
export class FinancialTransactionRepository
  extends BaseRepository<FinancialTransaction>
  implements IFinancialTransactionRepository
{
  constructor(
    @inject('IFinancialTransactionAdapter') adapter: IFinancialTransactionAdapter
  ) {
    super(adapter);
  }

  protected override async beforeCreate(
    data: Partial<FinancialTransaction>
  ): Promise<Partial<FinancialTransaction>> {
    FinancialTransactionValidator.validate(data);
    return this.formatData(data);
  }

  protected override async afterCreate(
    data: FinancialTransaction
  ): Promise<void> {
    NotificationService.showSuccess('Transaction entry created successfully');
  }

  protected override async beforeUpdate(
    id: string,
    data: Partial<FinancialTransaction>
  ): Promise<Partial<FinancialTransaction>> {
    FinancialTransactionValidator.validate(data);
    return this.formatData(data);
  }

  protected override async afterUpdate(
    data: FinancialTransaction
  ): Promise<void> {
    NotificationService.showSuccess('Transaction entry updated successfully');
  }

  protected override async afterDelete(id: string): Promise<void> {
    NotificationService.showSuccess('Transaction entry deleted successfully');
  }

  private formatData(
    data: Partial<FinancialTransaction>
  ): Partial<FinancialTransaction> {
    const formatted = { ...data };
    if (formatted.description) {
      formatted.description = formatted.description.trim();
    }
    return formatted;
  }
}
