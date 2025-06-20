import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { Account } from '../models/account.model';
import { AccountAdapter } from '../adapters/account.adapter';
import { NotificationService } from '../services/NotificationService';
import { AccountValidator } from '../validators/account.validator';

@injectable()
export class AccountRepository extends BaseRepository<Account> {
  constructor(@inject(AccountAdapter) adapter: AccountAdapter) {
    super(adapter);
  }

  protected override async beforeCreate(data: Partial<Account>): Promise<Partial<Account>> {
    // Validate account data
    AccountValidator.validate(data);
    
    // Format data before creation
    return this.formatAccountData(data);
  }

  protected override async afterCreate(data: Account): Promise<void> {
    // Additional repository-level operations after creation
    NotificationService.showSuccess(`Account "${data.name}" created successfully`);
  }

  protected override async beforeUpdate(id: string, data: Partial<Account>): Promise<Partial<Account>> {
    // Validate account data
    AccountValidator.validate(data);
    
    // Format data before update
    return this.formatAccountData(data);
  }

  protected override async afterUpdate(data: Account): Promise<void> {
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

  private formatAccountData(data: Partial<Account>): Partial<Account> {
    const formattedData = { ...data };
    
    if (formattedData.name) {
      formattedData.name = formattedData.name.trim();
    }
    
    if (formattedData.account_number) {
      formattedData.account_number = formattedData.account_number.trim();
    }
    
    if (formattedData.email) {
      formattedData.email = formattedData.email.toLowerCase().trim();
    }
    
    return formattedData;
  }
}