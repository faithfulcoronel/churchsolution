import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMenuItems } from '../src/hooks/useMenuItems';
import { navigation } from '../src/config/navigation';

vi.mock('@tanstack/react-query', () => ({
  useQuery: (opts: any) => ({ data: opts.queryFn() })
}));

let menuItems: any[] = [];
let featureRows: any[] = [];
let roleItems: any[] = [];

const itemsChain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  order: vi.fn(() => Promise.resolve({ data: menuItems, error: null }))
};

const featuresChain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  is: vi.fn(() => Promise.resolve({ data: featureRows, error: null }))
};

const permsChain = {
  select: vi.fn().mockReturnThis(),
  in: vi.fn(() => Promise.resolve({ data: roleItems, error: null }))
};

vi.mock('../src/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(() => Promise.resolve({ data: [{ id: 't1' }], error: null })),
    from: vi.fn((table: string) => {
      if (table === 'menu_items') return itemsChain as any;
      if (table === 'license_features') return featuresChain as any;
      if (table === 'role_menu_items') return permsChain as any;
      return {} as any;
    })
  }
}));

beforeEach(() => {
  menuItems = [];
  featureRows = [];
  roleItems = [];
  process.env.VITE_ENABLE_DYNAMIC_MENU = 'true';
});

describe('useMenuItems', () => {
  it('filters menu items by role and license', async () => {
    menuItems = [
      { id: '1', parent_id: null, code: 'finance.approve', feature_key: 'finance.approve', label: 'Approve', path: '/approve', icon: 'Home', sort_order: 1, is_system: false, role_menu_items: [] },
      { id: '2', parent_id: null, code: 'finance.report', feature_key: 'finance.report', label: 'Report', path: '/report', icon: 'Home', sort_order: 2, is_system: false, role_menu_items: [] },
      { id: '3', parent_id: null, code: 'admin.manage', feature_key: 'admin.manage', label: 'Admin', path: '/admin', icon: 'Home', sort_order: 3, is_system: false, role_menu_items: roleItems }
    ];
    featureRows = [
      { plan_name: 'full', feature_key: 'finance.approve' },
      { plan_name: 'full', feature_key: 'admin.manage' }
    ];
    roleItems = [{ role_id: 'r1' }];

    const { data } = useMenuItems(['r1']);
    const menus = await data;
    expect(menus.map((m: any) => m.name)).toEqual(['Approve', 'Admin']);
  });

  it('falls back to static navigation when no licensed items remain', async () => {
    menuItems = [
      { id: '1', parent_id: null, code: 'finance.approve', feature_key: 'finance.approve', label: 'Approve', path: '/approve', icon: 'Home', sort_order: 1, is_system: false, role_menu_items: [] }
    ];
    featureRows = [
      { plan_name: 'full', feature_key: 'other.feature' }
    ];
    roleItems = [];

    const { data } = useMenuItems(['r1']);
    const menus = await data;
    expect(menus).toBe(navigation);
  });
});
