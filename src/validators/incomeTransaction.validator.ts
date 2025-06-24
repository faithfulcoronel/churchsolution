import { IncomeTransaction } from '../models/incomeTransaction.model';

export class IncomeTransactionValidator {
  static validate(data: Partial<IncomeTransaction>): void {
    if (data.transaction_date !== undefined && !data.transaction_date) {
      throw new Error('Transaction date is required');
    }
    if (data.description !== undefined && !data.description.trim()) {
      throw new Error('Description is required');
    }
    if (
      data.amount !== undefined &&
      (isNaN(Number(data.amount)) || data.amount === null)
    ) {
      throw new Error('Amount must be a valid number');
    }
  }
}
