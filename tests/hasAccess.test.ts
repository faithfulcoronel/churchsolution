import { describe, it, expect } from 'vitest';
import { computeAccess } from '../src/utils/access';

describe('computeAccess', () => {
  it('returns true when permission and feature allowed', () => {
    const result = computeAccess(
      () => true,
      () => true,
      'perm.ok',
      'feat.ok'
    );
    expect(result).toBe(true);
  });

  it('returns false when permission missing', () => {
    const result = computeAccess(
      () => false,
      () => true,
      'perm.no',
      'feat.ok'
    );
    expect(result).toBe(false);
  });

  it('returns false when feature disabled', () => {
    const result = computeAccess(
      () => true,
      () => false,
      'perm.ok',
      'feat.bad'
    );
    expect(result).toBe(false);
  });

  it('allows when keys are empty', () => {
    const result = computeAccess(
      () => false,
      () => false,
      '',
      ''
    );
    expect(result).toBe(true);
  });
});
