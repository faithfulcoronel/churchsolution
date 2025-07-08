import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useRoleMenuItemRepository } from '../../hooks/useRoleMenuItemRepository';
import { useMenuItemRepository } from '../../hooks/useMenuItemRepository';
import { Card, CardContent } from '../../components/ui2/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui2/select';
import { Checkbox } from '../../components/ui2/checkbox';
import { Loader2, ListChecks } from 'lucide-react';

interface Role {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  code: string;
  label: string;
  is_system: boolean;
}

function MenuPermissions() {
  const [roleId, setRoleId] = useState<string>('');
  const { useQuery: useMenuPermQuery, useCreate, useDelete } = useRoleMenuItemRepository();
  const { useQuery: useMenuItemsQuery } = useMenuItemRepository();

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('roles').select('id,name').order('name');
      if (error) throw error;
      return data as Role[];
    },
  });

  const { data: itemsRes } = useMenuItemsQuery({ order: { column: 'sort_order' } });
  const menuItems = (itemsRes?.data as MenuItem[]) || [];

  const { data: featureRows } = useQuery({
    queryKey: ['license-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('license_features')
        .select('feature,licenses(status,expires_at)');
      if (error) throw error;
      return data || [];
    },
  });

  const activeFeatures = React.useMemo(() => {
    if (!featureRows) return [] as string[];
    const today = new Date().toISOString().slice(0, 10);
    return featureRows
      .filter(
        (f: any) =>
          f.licenses?.status === 'active' && (!f.licenses.expires_at || f.licenses.expires_at >= today)
      )
      .map((f: any) => f.feature);
  }, [featureRows]);

  const { data: permsRes } = useMenuPermQuery({
    filters: roleId ? { role_id: { operator: 'eq', value: roleId } } : {},
    enabled: !!roleId,
  });
  const current = (permsRes?.data as any[]) || [];

  const createMutation = useCreate();
  const deleteMutation = useDelete();

  const toggle = async (item: MenuItem) => {
    if (!roleId) return;
    const existing = current.find(p => p.menu_item_id === item.id);
    if (existing) {
      await deleteMutation.mutateAsync(existing.id);
    } else {
      await createMutation.mutateAsync({ data: { menu_item_id: item.id, role_id: roleId } });
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center gap-3">
        <ListChecks className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Menu Permissions</h1>
      </div>
      <div className="max-w-xs">
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger label="Role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roles?.map(r => (
              <SelectItem key={r.id} value={r.id} className="capitalize">
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {roleId && (
        <Card>
          <CardContent className="space-y-2 py-4">
            {menuItems.length === 0 && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            {menuItems.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <Checkbox
                  id={item.id}
                  checked={!!current.find(p => p.menu_item_id === item.id)}
                  onCheckedChange={() => toggle(item)}
                  disabled={!item.is_system && !activeFeatures.includes(item.code)}
                />
                <label htmlFor={item.id} className="capitalize">
                  {item.label}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MenuPermissions;
