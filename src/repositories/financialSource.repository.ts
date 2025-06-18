import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { FinancialSource } from '../models/financialSource.model';
import { FinancialSourceAdapter } from '../adapters/financialSource.adapter';
import { useMessageStore } from '../components/MessageHandler';

@injectable()
export class FinancialSourceRepository extends BaseRepository<FinancialSource> {
  constructor(@inject(FinancialSourceAdapter) adapter: FinancialSourceAdapter) {
    super(adapter);
  }

  protected override async beforeCreate(data: Partial<FinancialSource>): Promise<Partial<FinancialSource>> {
    // Additional repository-level validation
    this.validateSourceData(data);
    
    // Format data before creation
    return this.formatSourceData(data);
  }

  protected override async afterCreate(data: FinancialSource): Promise<void> {
    // Additional repository-level operations after creation
    const { addMessage } = useMessageStore.getState();
    addMessage({
      type: 'success',
      text: `Financial source "${data.name}" created successfully`,
      duration: 3000,
    });
  }

  protected override async beforeUpdate(id: string, data: Partial<FinancialSource>): Promise<Partial<FinancialSource>> {
    // Additional repository-level validation
    this.validateSourceData(data);
    
    // Format data before update
    return this.formatSourceData(data);
  }

  protected override async afterUpdate(data: FinancialSource): Promise<void> {
    // Additional repository-level operations after update
    const { addMessage } = useMessageStore.getState();
    addMessage({
      type: 'success',
      text: `Financial source "${data.name}" updated successfully`,
      duration: 3000,
    });
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
    const { addMessage } = useMessageStore.getState();
    addMessage({
      type: 'success',
      text: 'Financial source deleted successfully',
      duration: 3000,
    });
  }

  // Private helper methods
  private validateSourceData(data: Partial<FinancialSource>): void {
    const errors: string[] = [];

    // Basic validation
    if (data.name !== undefined && !data.name.trim()) {
      errors.push('Source name is required');
    }
    
    if (data.source_type !== undefined) {
      const validTypes = ['bank', 'fund', 'wallet', 'cash', 'online', 'other'];
      if (!validTypes.includes(data.source_type)) {
        errors.push('Invalid source type. Must be one of: bank, fund, wallet, cash, online, other');
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