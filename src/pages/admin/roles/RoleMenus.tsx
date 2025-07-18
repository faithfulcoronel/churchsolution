import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  useMenuItemRepository,
  useRoleMenuItemRepository,
  useRoleRepository,
} from '../../../hooks';
import { supabase } from '../../../lib/supabase';
import BackButton from '../../../components/BackButton';
import { NotificationService } from '../../../services/NotificationService';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui2/card';
import { TreeView, TreeItem } from '../../../components/ui2/treeview';
import { Checkbox } from '../../../components/ui2/checkbox';
import { Button } from '../../../components/ui2/button';
import { ListChecks, Loader2 } from 'lucide-react';

interface MenuItem {
  id: string;
  parent_id: string | null;
  label: string;
  sort_order: number | null;
  is_system: boolean;
  feature_key: string | null;
}

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
}

interface MenuNode extends MenuItem {
  children: MenuNode[];
  permissions: Permission[];
}

function buildTree(
  items: MenuItem[],
  permsByMenu: Record<string, Permission[]>
): MenuNode[] {
  const map = new Map<string, MenuNode>();
  items.forEach(i =>
    map.set(i.id, { ...i, children: [], permissions: permsByMenu[i.id] || [] })
  );
  const roots: MenuNode[] = [];

  map.forEach(item => {
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id)!.children.push(item);
    } else {
      roots.push(item);
    }
  });

  const sortRec = (arr: MenuNode[]) => {
    arr.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    arr.forEach(c => sortRec(c.children));
  };
  sortRec(roots);
  return roots;
}

function RoleMenus() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useQuery: useMenuQuery } = useMenuItemRepository();
  const { useQuery: useRoleMenuQuery, replaceForRole } =
    useRoleMenuItemRepository();
  const { updatePermissions } = useRoleRepository();

  const { data: itemsRes } = useMenuQuery({ order: { column: 'sort_order' } });
  const items = (itemsRes?.data as MenuItem[]) || [];

  const { data: permsRes } = useRoleMenuQuery({
    filters: id ? { role_id: { operator: 'eq', value: id } } : {},
    enabled: !!id,
  });
  const currentIds = ((permsRes?.data as any[]) || []).map((p: any) => p.menu_item_id);

  const { data: menuPermRows } = useQuery({
    queryKey: ['menu-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_permissions')
        .select(
          'menu_item_id, permission:permissions(id,code,name,description,module)'
        );
      if (error) throw error;
      return data as { menu_item_id: string; permission: Permission }[];
    },
  });

  const permsByMenu = useMemo(() => {
    const map: Record<string, Permission[]> = {};
    (menuPermRows || []).forEach(r => {
      if (r.permission) {
        if (!map[r.menu_item_id]) map[r.menu_item_id] = [];
        map[r.menu_item_id].push(r.permission);
      }
    });
    return map;
  }, [menuPermRows]);

  const { data: rolePermRows } = useQuery({
    queryKey: ['role-permissions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_menu_items')
        .select('menu_permissions(permission_id)')
        .eq('role_id', id!);
      if (error) throw error;
      return data as { menu_permissions: { permission_id: string }[] }[];
    },
    enabled: !!id,
  });

  const currentPermIds = useMemo(
    () =>
      (rolePermRows || [])
        .flatMap(r => r.menu_permissions || [])
        .map(mp => mp.permission_id),
    [rolePermRows]
  );

  const { data: featureRows } = useQuery({
    queryKey: ['license-features'],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data: licenses, error: licErr } = await supabase
        .from('licenses')
        .select('plan_name,status,expires_at')
        .is('deleted_at', null);
      if (licErr) throw licErr;

      const plans = (licenses || [])
        .filter(l => l.status === 'active' && (!l.expires_at || l.expires_at >= today))
        .map(l => l.plan_name);

      if (plans.length === 0) return [];

      const { data, error } = await supabase
        .from('license_features')
        .select('plan_name,feature_key')
        .in('plan_name', plans)
        .is('deleted_at', null);
      if (error) throw error;
      return data || [];
    },
  });

  const activeFeatures = useMemo(() => {
    if (!featureRows) return [] as string[];
    return featureRows.map((f: any) => f.feature_key);
  }, [featureRows]);

  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  useEffect(() => {
    setSelectedMenus(currentIds);
  }, [currentIds]);

  useEffect(() => {
    setSelectedPerms(currentPermIds);
  }, [currentPermIds]);

  const tree = useMemo(() => buildTree(items, permsByMenu), [items, permsByMenu]);

  const toggleMenu = (mid: string) => {
    setSelectedMenus(prev =>
      prev.includes(mid) ? prev.filter(id => id !== mid) : [...prev, mid]
    );
  };

  const togglePermission = (pid: string) => {
    setSelectedPerms(prev =>
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const renderNode = (node: MenuNode) => {
    const disabled = !node.is_system && !activeFeatures.includes(node.feature_key ?? '');
    return (
      <TreeItem
        key={node.id}
        id={node.id}
        label={
          <div className="flex items-center gap-2">
            <Checkbox
              id={`chk-${node.id}`}
              size="sm"
              checked={selectedMenus.includes(node.id)}
              onCheckedChange={() => toggleMenu(node.id)}
              disabled={disabled}
            />
            <label
              htmlFor={`chk-${node.id}`}
              className={disabled ? 'text-muted-foreground capitalize' : 'capitalize'}
            >
              {node.label}
            </label>
          </div>
        }
      >
        {node.permissions.map(p => (
          <TreeItem
            key={`perm-${p.id}`}
            id={`perm-${p.id}`}
            label={
              <div className="flex items-center gap-2 ml-6">
                <Checkbox
                  id={`chk-perm-${p.id}`}
                  size="sm"
                  checked={selectedPerms.includes(p.id)}
                  onCheckedChange={() => togglePermission(p.id)}
                  disabled={disabled}
                />
                <label
                  htmlFor={`chk-perm-${p.id}`}
                  className={disabled ? 'text-muted-foreground capitalize' : 'capitalize'}
                >
                  {p.name}
                </label>
              </div>
            }
          />
        ))}
        {node.children.map(child => renderNode(child))}
      </TreeItem>
    );
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      await replaceForRole(id, selectedMenus);
      await updatePermissions(id, selectedPerms);
      NotificationService.showSuccess('Menus updated');
      navigate(`/administration/roles/${id}`);
    } catch (error) {
      console.error('Error saving menus:', error);
      if (error instanceof Error) {
        NotificationService.showError(error.message, 5000);
      }
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackPath="/administration/roles" label="Back to Roles" />
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <ListChecks className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-medium">Edit Role Menus</h3>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <TreeView>{tree.map(n => renderNode(n))}</TreeView>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => navigate(`/administration/roles/${id}`)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default RoleMenus;

