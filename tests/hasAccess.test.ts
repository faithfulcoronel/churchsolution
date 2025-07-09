import { describe, it, expect } from 'vitest';
import { computeAccess } from '../src/utils/access';

describe('computeAccess', () => {
  it('returns true when permission and feature allowed', () => {
    const result = computeAccess(
      () => true,
      () => true,
      'perm.ok',
      'feat.ok',
      false
    );
    expect(result).toBe(true);
  });

  it('returns false when permission missing', () => {
    const result = computeAccess(
      () => false,
      () => true,
      'perm.no',
      'feat.ok',
      false
    );
    expect(result).toBe(false);
  });

  it('returns false when feature disabled', () => {
    const result = computeAccess(
      () => true,
      () => false,
      'perm.ok',
      'feat.bad',
      false
    );
    expect(result).toBe(false);
  });

  it('allows when keys are empty', () => {
    const result = computeAccess(
      () => false,
      () => false,
      '',
      '',
      false
    );
    expect(result).toBe(true);
  });

  it('allows when user is admin regardless of checks', () => {
    const result = computeAccess(
      () => false,
      () => false,
      'perm.no',
      'feat.no',
      true
    );
    expect(result).toBe(true);
  });
});
