import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { ChartOfAccount } from '../models/chartOfAccount.model';
import { ChartOfAccountAdapter } from '../adapters/chartOfAccount.adapter';
import { NotificationService } from '../services/NotificationService';

@injectable()
export class ChartOfAccountRepository extends BaseRepository<ChartOfAccount> {
  constructor(@inject(ChartOfAccountAdapter) adapter: ChartOfAccountAdapter) {
    super(adapter);
  }

  protected override async beforeCreate(data: Partial<ChartOfAccount>): Promise<Partial<ChartOfAccount>> {
    // Additional repository-level validation
    this.validateAccountData(data);
    
    // Format data before creation
    return this.formatAccountData(data);
  }

  protected override async afterCreate(data: ChartOfAccount): Promise<void> {
    // Additional repository-level operations after creation
    NotificationService.showSuccess(`Account "${data.name}" created successfully`);
  }

  protected override async beforeUpdate(id: string, data: Partial<ChartOfAccount>): Promise<Partial<ChartOfAccount>> {
    // Additional repository-level validation
    this.validateAccountData(data);
    
    // Format data before update
    return this.formatAccountData(data);
  }

  protected override async afterUpdate(data: ChartOfAccount): Promise<void> {
    // Additional repository-level operations after update
    NotificationService.showSuccess(`Account "${data.name}" updated successfully`);
  }

  protected override async beforeDelete(id: string): Promise<void> {
    // Additional repository-level validation before delete
    const account = await this.findById(id);
    if (!account) {
      throw new Error('Account not found');
    }
  }

  protected override async afterDelete(id: string): Promise<void> {
    // Additional repository-level cleanup after delete
    NotificationService.showSuccess('Account deleted successfully');
  }

  // Private helper methods
  private validateAccountData(data: Partial<ChartOfAccount>): void {
    const errors: string[] = [];

    // Basic validation
    if (data.code !== undefined && !data.code.trim()) {
      errors.push('Account code is required');
    }
    
    if (data.name !== undefined && !data.name.trim()) {
      errors.push('Account name is required');
    }
    
    if (data.account_type !== undefined) {
      const validTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
      if (!validTypes.includes(data.account_type)) {
        errors.push('Invalid account type. Must be one of: asset, liability, equity, revenue, expense');
      }
    }

    if (errors.length > 0) {
      errors.forEach(error => {
        NotificationService.showError(error, 5000);
      });
      throw new Error('Validation failed: ' + errors.join(', '));
    }
  }

  private formatAccountData(data: Partial<ChartOfAccount>): Partial<ChartOfAccount> {
    const formattedData = { ...data };
    
    if (formattedData.code) {
      formattedData.code = formattedData.code.trim();
    }
    
    if (formattedData.name) {
      formattedData.name = formattedData.name.trim();
    }
    
    return formattedData;
  }

  public async getHierarchy(): Promise<ChartOfAccount[]> {
    return (this.adapter as ChartOfAccountAdapter).getHierarchy();
  }
}