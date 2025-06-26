import { Fund } from '../models/fund.model';

export class FundValidator {
  static validate(data: Partial<Fund>): void {
    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('Fund name is required');
    }

    if (data.type !== undefined) {
      const validTypes: Fund['type'][] = ['restricted', 'unrestricted'];
      if (!validTypes.includes(data.type)) {
        throw new Error('Invalid fund type. Must be one of: restricted, unrestricted');
      }
    }
  }
}
