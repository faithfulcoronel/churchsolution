import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { IncomeTransaction } from '../models/incomeTransaction.model';
import type { IIncomeTransactionAdapter } from '../adapters/incomeTransaction.adapter';
import { NotificationService } from '../services/NotificationService';
import { IncomeTransactionValidator } from '../validators/incomeTransaction.validator';

export interface IIncomeTransactionRepository extends BaseRepository<IncomeTransaction> {}

@injectable()
export class IncomeTransactionRepository
  extends BaseRepository<IncomeTransaction>
  implements IIncomeTransactionRepository
{
  constructor(@inject('IIncomeTransactionAdapter') adapter: IIncomeTransactionAdapter) {
    super(adapter);
  }

  protected override async beforeCreate(
    data: Partial<IncomeTransaction>
  ): Promise<Partial<IncomeTransaction>> {
    IncomeTransactionValidator.validate(data);
    return this.formatData(data);
  }

  protected override async afterCreate(data: IncomeTransaction): Promise<void> {
    NotificationService.showSuccess('Income transaction created successfully');
  }

  protected override async beforeUpdate(
    id: string,
    data: Partial<IncomeTransaction>
  ): Promise<Partial<IncomeTransaction>> {
    IncomeTransactionValidator.validate(data);
    return this.formatData(data);
  }

  protected override async afterUpdate(data: IncomeTransaction): Promise<void> {
    NotificationService.showSuccess('Income transaction updated successfully');
  }

  protected override async afterDelete(id: string): Promise<void> {
    NotificationService.showSuccess('Income transaction deleted successfully');
  }

  private formatData(
    data: Partial<IncomeTransaction>
  ): Partial<IncomeTransaction> {
    const formatted = { ...data };
    if (formatted.description) {
      formatted.description = formatted.description.trim();
    }
    if (formatted.reference) {
      formatted.reference = formatted.reference.trim();
    }
    return formatted;
  }
}
