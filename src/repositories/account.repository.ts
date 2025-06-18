import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { Account } from '../models/account.model';
import { AccountAdapter } from '../adapters/account.adapter';
import { useMessageStore } from '../components/MessageHandler';

@injectable()
export class AccountRepository extends BaseRepository<Account> {
  constructor(@inject(AccountAdapter) adapter: AccountAdapter) {
    super(adapter);
  }

  protected override async beforeCreate(data: Partial<Account>): Promise<Partial<Account>> {
    // Additional repository-level validation
    this.validateAccountData(data);
    
    // Format data before creation
    return this.formatAccountData(data);
  }

  protected override async afterCreate(data: Account): Promise<void> {
    // Additional repository-level operations after creation
    const { addMessage } = useMessageStore.getState();
    addMessage({
      type: 'success',
      text: `Account "${data.name}" created successfully`,
      duration: 3000,
    });
  }

  protected override async beforeUpdate(id: string, data: Partial<Account>): Promise<Partial<Account>> {
    // Additional repository-level validation
    this.validateAccountData(data);
    
    // Format data before update
    return this.formatAccountData(data);
  }

  protected override async afterUpdate(data: Account): Promise<void> {
    // Additional repository-level operations after update
    const { addMessage } = useMessageStore.getState();
    addMessage({
      type: 'success',
      text: `Account "${data.name}" updated successfully`,
      duration: 3000,
    });
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
    const { addMessage } = useMessageStore.getState();
    addMessage({
      type: 'success',
      text: 'Account deleted successfully',
      duration: 3000,
    });
  }

  // Private helper methods
  private validateAccountData(data: Partial<Account>): void {
    const errors: string[] = [];

    // Basic validation
    if (data.name !== undefined && !data.name.trim()) {
      errors.push('Account name is required');
    }
    
    if (data.account_number !== undefined && !data.account_number.trim()) {
      errors.push('Account number is required');
    }
    
    if (data.account_type !== undefined && 
        !['organization', 'person'].includes(data.account_type)) {
      errors.push('Account type must be either "organization" or "person"');
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }

    if (errors.length > 0) {
      const { addMessage } = useMessageStore.getState();
      errors.forEach(error => {
        addMessage({
          type: 'error',
          text: error,
          duration: 5000,
        });
      });
      throw new Error('Validation failed: ' + errors.join(', '));
    }
  }

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