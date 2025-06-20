import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { FinancialSource } from '../models/financialSource.model';
import { FinancialSourceAdapter } from '../adapters/financialSource.adapter';
import { NotificationService } from '../services/NotificationService';
import { FinancialSourceValidator } from '../validators/financialSource.validator';

@injectable()
export class FinancialSourceRepository extends BaseRepository<FinancialSource> {
  constructor(@inject(FinancialSourceAdapter) adapter: FinancialSourceAdapter) {
    super(adapter);
  }

  protected override async beforeCreate(data: Partial<FinancialSource>): Promise<Partial<FinancialSource>> {
    // Validate source data
    FinancialSourceValidator.validate(data);
    
    // Format data before creation
    return this.formatSourceData(data);
  }

  protected override async afterCreate(data: FinancialSource): Promise<void> {
    // Additional repository-level operations after creation
    NotificationService.showSuccess(`Financial source "${data.name}" created successfully`);
  }

  protected override async beforeUpdate(id: string, data: Partial<FinancialSource>): Promise<Partial<FinancialSource>> {
    // Validate source data
    FinancialSourceValidator.validate(data);
    
    // Format data before update
    return this.formatSourceData(data);
  }

  protected override async afterUpdate(data: FinancialSource): Promise<void> {
    // Additional repository-level operations after update
    NotificationService.showSuccess(`Financial source "${data.name}" updated successfully`);
  }

  protected override async beforeDelete(id: string): Promise<void> {
    // Additional repository-level validation before delete
    const source = await this.findById(id);
    if (!source) {
      throw new Error('Financial source not found');
    }
  }

  protected override async afterDelete(id: string): Promise<void> {
    // Additional repository-level cleanup after delete
    NotificationService.showSuccess('Financial source deleted successfully');
  }

  // Private helper methods

  private formatSourceData(data: Partial<FinancialSource>): Partial<FinancialSource> {
    const formattedData = { ...data };
    
    if (formattedData.name) {
      formattedData.name = formattedData.name.trim();
    }
    
    if (formattedData.account_number) {
      formattedData.account_number = formattedData.account_number.trim();
    }
    
    return formattedData;
  }
}