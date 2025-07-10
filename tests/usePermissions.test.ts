import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePermissions } from '../src/hooks/usePermissions';

const useQueryMock = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: useQueryMock
}));

vi.mock('../src/stores/authStore', () => ({
  useAuthStore: () => ({ user: { id: 'u1' } })
}));

vi.mock('../src/components/MessageHandler', () => ({
  useMessageStore: () => ({ addMessage: vi.fn() })
}));

vi.mock('../src/utils/tenantUtils', () => ({
  tenantUtils: { getTenantId: vi.fn() }
}));

vi.mock('../src/lib/supabase', () => ({
  supabase: {}
}));

describe('usePermissions admin roles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hasPermission allows tenant_admin and super_admin', () => {
    useQueryMock.mockReturnValue({ data: { permissions: [], roles: [], adminRole: 'tenant_admin' }, isLoading: false });
    let perms = usePermissions();
    expect(perms.hasPermission('any')).toBe(true);

    useQueryMock.mockReturnValue({ data: { permissions: [], roles: [], adminRole: 'super_admin' }, isLoading: false });
    perms = usePermissions();
    expect(perms.hasPermission('any')).toBe(true);
  });

  it('isAdmin recognizes all admin roles', () => {
    useQueryMock.mockReturnValue({ data: { permissions: [], roles: [{ role_name: 'super_admin' }], adminRole: null }, isLoading: false });
    let perms = usePermissions();
    expect(perms.isAdmin()).toBe(true);

    useQueryMock.mockReturnValue({ data: { permissions: [], roles: [], adminRole: 'super_admin' }, isLoading: false });
    perms = usePermissions();
    expect(perms.isAdmin()).toBe(true);

    useQueryMock.mockReturnValue({ data: { permissions: [], roles: [], adminRole: 'tenant_admin' }, isLoading: false });
    perms = usePermissions();
    expect(perms.isAdmin()).toBe(true);
  });
});
