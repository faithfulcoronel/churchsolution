import { describe, it, expect } from 'vitest';
import { computeAccess } from '../src/utils/access';

describe('super admin access', () => {
  it('grants access when user is super admin', () => {
    const allowed = computeAccess(
      () => false,
      () => false,
      'any.permission',
      'any.feature',
      true
    );
    expect(allowed).toBe(true);
  });
});
