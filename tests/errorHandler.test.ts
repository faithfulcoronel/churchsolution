import { describe, it, expect } from 'vitest';
import { handleError } from '../src/utils/errorHandler';

describe('handleError', () => {
  it('returns error message when error type is unknown', () => {
    const result = handleError(new Error('foo'));
    expect(result.message).toBe('foo');
  });
});
