import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { FinancialTransactionHeader } from '../models/financialTransactionHeader.model';
import { FinancialTransactionHeaderAdapter } from '../adapters/financialTransactionHeader.adapter';
import { NotificationService } from '../services/NotificationService';

@injectable()
export class FinancialTransactionHeaderRepository extends BaseRepository<FinancialTransactionHeader> {
  constructor(@inject(FinancialTransactionHeaderAdapter) adapter: FinancialTransactionHeaderAdapter) {
    super(adapter);
  }

  protected override async beforeCreate(data: Partial<FinancialTransactionHeader>): Promise<Partial<FinancialTransactionHeader>> {
    // Additional repository-level validation
    this.validateHeaderData(data);
    
    // Format data before creation
    return this.formatHeaderData(data);
  }

  protected override async afterCreate(data: FinancialTransactionHeader): Promise<void> {
    // Additional repository-level operations after creation
    NotificationService.showSuccess(`Transaction "${data.transaction_number}" created successfully`);
  }

  protected override async beforeUpdate(id: string, data: Partial<FinancialTransactionHeader>): Promise<Partial<FinancialTransactionHeader>> {
    // Additional repository-level validation
    this.validateHeaderData(data);
    
    // Format data before update
    return this.formatHeaderData(data);
  }

  protected override async afterUpdate(data: FinancialTransactionHeader): Promise<void> {
    // Additional repository-level operations after update
    NotificationService.showSuccess(`Transaction "${data.transaction_number}" updated successfully`);
  }

  protected override async beforeDelete(id: string): Promise<void> {
    // Additional repository-level validation before delete
    const header = await this.findById(id);
    if (!header) {
      throw new Error('Transaction not found');
    }
    
    if (header.status !== 'draft') {
      throw new Error(`Cannot delete a ${header.status} transaction`);
    }
  }

  protected override async afterDelete(id: string): Promise<void> {
    // Additional repository-level cleanup after delete
    NotificationService.showSuccess('Transaction deleted successfully');
  }

  // Private helper methods
  private validateHeaderData(data: Partial<FinancialTransactionHeader>): void {
    const errors: string[] = [];

    // Basic validation
    if (data.transaction_date !== undefined && !data.transaction_date) {
      errors.push('Transaction date is required');
    }
    
    if (data.description !== undefined && !data.description.trim()) {
      errors.push('Description is required');
    }
    
    if (data.status !== undefined) {
      const validStatuses = ['draft', 'posted', 'voided'];
      if (!validStatuses.includes(data.status)) {
        errors.push('Invalid status. Must be one of: draft, posted, voided');
      }
    }

    if (errors.length > 0) {
      errors.forEach(error => {
        NotificationService.showError(error, 5000);
      });
      throw new Error('Validation failed: ' + errors.join(', '));
    }
  }

  private formatHeaderData(data: Partial<FinancialTransactionHeader>): Partial<FinancialTransactionHeader> {
    const formattedData = { ...data };
    
    if (formattedData.description) {
      formattedData.description = formattedData.description.trim();
    }
    
    if (formattedData.reference) {
      formattedData.reference = formattedData.reference.trim();
    }
    
    return formattedData;
  }

  public async postTransaction(id: string): Promise<void> {
    try {
      await (this.adapter as FinancialTransactionHeaderAdapter).postTransaction(id);
      
      NotificationService.showSuccess('Transaction posted successfully');
    } catch (error) {
      NotificationService.showError(
        error instanceof Error ? error.message : 'Failed to post transaction',
        5000
      );
      throw error;
    }
  }

  public async voidTransaction(id: string, reason: string): Promise<void> {
    try {
      await (this.adapter as FinancialTransactionHeaderAdapter).voidTransaction(id, reason);
      
      NotificationService.showSuccess('Transaction voided successfully');
    } catch (error) {
      NotificationService.showError(
        error instanceof Error ? error.message : 'Failed to void transaction',
        5000
      );
      throw error;
    }
  }

  public async getTransactionEntries(headerId: string): Promise<any[]> {
    return (this.adapter as FinancialTransactionHeaderAdapter).getTransactionEntries(headerId);
  }

  public async isTransactionBalanced(headerId: string): Promise<boolean> {
    return (this.adapter as FinancialTransactionHeaderAdapter).isTransactionBalanced(headerId);
  }
}