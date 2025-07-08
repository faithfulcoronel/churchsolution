import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  useMenuItemRepository,
  useRoleMenuItemRepository,
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

interface MenuNode extends MenuItem {
  children: MenuNode[];
}

function buildTree(items: MenuItem[]): MenuNode[] {
  const map = new Map<string, MenuNode>();
  items.forEach(i => map.set(i.id, { ...i, children: [] }));
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
  const { useQuery: useRoleMenuQuery, replaceForRole } = useRoleMenuItemRepository();

  const { data: itemsRes } = useMenuQuery({ order: { column: 'sort_order' } });
  const items = (itemsRes?.data as MenuItem[]) || [];

  const { data: permsRes } = useRoleMenuQuery({
    filters: id ? { role_id: { operator: 'eq', value: id } } : {},
    enabled: !!id,
  });
  const currentIds = ((permsRes?.data as any[]) || []).map((p: any) => p.menu_item_id);

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

  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected(currentIds);
  }, [currentIds]);

  const tree = useMemo(() => buildTree(items), [items]);

  const toggle = (mid: string) => {
    setSelected(prev =>
      prev.includes(mid) ? prev.filter(id => id !== mid) : [...prev, mid]
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
              checked={selected.includes(node.id)}
              onCheckedChange={() => toggle(node.id)}
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
        {node.children.map(child => renderNode(child))}
      </TreeItem>
    );
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      await replaceForRole(id, selected);
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

