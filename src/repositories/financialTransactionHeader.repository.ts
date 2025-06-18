import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { FinancialTransactionHeader } from '../models/financialTransactionHeader.model';
import { FinancialTransactionHeaderAdapter } from '../adapters/financialTransactionHeader.adapter';
import { useMessageStore } from '../components/MessageHandler';

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
    const { addMessage } = useMessageStore.getState();
    addMessage({
      type: 'success',
      text: `Transaction "${data.transaction_number}" created successfully`,
      duration: 3000,
    });
  }

  protected override async beforeUpdate(id: string, data: Partial<FinancialTransactionHeader>): Promise<Partial<FinancialTransactionHeader>> {
    // Additional repository-level validation
    this.validateHeaderData(data);
    
    // Format data before update
    return this.formatHeaderData(data);
  }

  protected override async afterUpdate(data: FinancialTransactionHeader): Promise<void> {
    // Additional repository-level operations after update
    const { addMessage } = useMessageStore.getState();
    addMessage({
      type: 'success',
      text: `Transaction "${data.transaction_number}" updated successfully`,
      duration: 3000,
    });
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
    const { addMessage } = useMessageStore.getState();
    addMessage({
      type: 'success',
      text: 'Transaction deleted successfully',
      duration: 3000,
    });
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
      
      const { addMessage } = useMessageStore.getState();
      addMessage({
        type: 'success',
        text: 'Transaction posted successfully',
        duration: 3000,
      });
    } catch (error) {
      const { addMessage } = useMessageStore.getState();
      addMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to post transaction',
        duration: 5000,
      });
      throw error;
    }
  }

  public async voidTransaction(id: string, reason: string): Promise<void> {
    try {
      await (this.adapter as FinancialTransactionHeaderAdapter).voidTransaction(id, reason);
      
      const { addMessage } = useMessageStore.getState();
      addMessage({
        type: 'success',
        text: 'Transaction voided successfully',
        duration: 3000,
      });
    } catch (error) {
      const { addMessage } = useMessageStore.getState();
      addMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to void transaction',
        duration: 5000,
      });
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