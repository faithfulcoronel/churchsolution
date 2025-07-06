import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasAccess } from '../src/utils/access';

const permMock = vi.fn();
const featureMock = vi.fn();

vi.mock('../src/hooks/usePermissions', () => ({
  usePermissions: () => ({ hasPermission: permMock })
}));

vi.mock('../src/hooks/useFeatures', () => ({
  useFeatures: () => ({ isEnabled: featureMock })
}));

beforeEach(() => {
  permMock.mockReset();
  featureMock.mockReset();
});

describe('hasAccess', () => {
  it('returns true when permission and feature allowed', () => {
    permMock.mockReturnValue(true);
    featureMock.mockReturnValue(true);
    expect(hasAccess('perm.ok', 'feat.ok')).toBe(true);
  });

  it('returns false when permission missing', () => {
    permMock.mockReturnValue(false);
    featureMock.mockReturnValue(true);
    expect(hasAccess('perm.no', 'feat.ok')).toBe(false);
  });

  it('returns false when feature disabled', () => {
    permMock.mockReturnValue(true);
    featureMock.mockReturnValue(false);
    expect(hasAccess('perm.ok', 'feat.bad')).toBe(false);
  });

  it('allows when keys are empty', () => {
    permMock.mockReturnValue(false);
    featureMock.mockReturnValue(false);
    expect(hasAccess('', '')).toBe(true);
  });
});
