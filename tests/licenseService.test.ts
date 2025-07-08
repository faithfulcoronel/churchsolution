import { describe, it, expect } from 'vitest';
import { LicenseService } from '../src/services/LicenseService';
import type { License } from '../src/models/license.model';

describe('LicenseService.resolveLicense', () => {
  const service = new LicenseService();

  it('returns current license when no overrides', () => {
    const lic: License = {
      id: '1',
      tenant_id: 't1',
      plan_name: 'basic',
      tier: 'basic',
      status: 'active',
      starts_at: null,
      expires_at: null
    };
    expect(service.resolveLicense(lic)).toEqual(lic);
  });

  it('merges overrides with current license', () => {
    const lic: License = {
      id: '1',
      tenant_id: 't1',
      plan_name: 'basic',
      tier: 'basic',
      status: 'active',
      starts_at: null,
      expires_at: null
    };
    const result = service.resolveLicense(lic, { plan_name: 'pro', status: 'trial' });
    expect(result).toEqual({
      ...lic,
      plan_name: 'pro',
      status: 'trial'
    });
  });

  it('returns override when no current license', () => {
    const override = { plan_name: 'pro', tier: 'premium', status: 'active' };
    expect(service.resolveLicense(null, override)).toEqual(override);
  });
});
