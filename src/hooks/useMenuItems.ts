import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { navigation as staticNavigation, NavItem } from "../config/navigation";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

function toPascalCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function getIcon(name: string | null): LucideIcon {
  if (!name) return Icons.Circle;
  const pascal = toPascalCase(name);
  const icon = (Icons as Record<string, LucideIcon>)[pascal];
  return icon || Icons.Circle;
}

const sectionMap = new Map<string, string>();
function collectSections(items: NavItem[]) {
  items.forEach((it) => {
    if (it.href) sectionMap.set(it.href, it.section ?? "General");
    if (it.submenu) collectSections(it.submenu);
  });
}
collectSections(staticNavigation);

export function useMenuItems(roleIds: string[]) {
  const enableDynamicMenu =
    import.meta.env.VITE_ENABLE_DYNAMIC_MENU !== "false";
  const rolesKey = roleIds.slice().sort().join(",");

  return useQuery({
    queryKey: ["menu-items", rolesKey],
    queryFn: async () => {
      if (!enableDynamicMenu) {
        return staticNavigation;
      }
      const { data: tenantData, error: tenantError } =
        await supabase.rpc("get_current_tenant");
      if (tenantError) throw tenantError;
      const tenant = tenantData?.[0];
      if (!tenant) return staticNavigation;

      const { data: items, error } = await supabase
        .from("menu_items")
        .select(
          `id,parent_id,code,label,path,icon,sort_order,is_system,section,role_menu_items(role_id)`,
        )
        .eq("tenant_id", tenant.id)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      if (!items || items.length === 0) {
        return staticNavigation;
      }

      const today = new Date().toISOString().slice(0, 10);
      const { data: licenses, error: licErr } = await supabase
        .from("licenses")
        .select("plan_name,status,expires_at")
        .eq("tenant_id", tenant.id)
        .is("deleted_at", null);
      if (licErr) throw licErr;

      const plans = (licenses || [])
        .filter(
          (l) => l.status === "active" && (!l.expires_at || l.expires_at >= today)
        )
        .map((l) => l.plan_name);

      const { data: featureRows, error: featureError } = await supabase
        .from("license_features")
        .select("feature_key")
        .eq("tenant_id", tenant.id)
        .in("plan_name", plans)
        .is("deleted_at", null);

      if (featureError) throw featureError;
      const features = (featureRows || []).map((f) => f.feature_key);

      const allowed = items.filter((item) => {
        const roleItems =
          (item.role_menu_items as { role_id: string }[]) || [];
        if (
          roleItems.length &&
          !roleItems.some((r) => roleIds.includes(r.role_id))
        ) {
          return false;
        }
        if (
          features.length > 0 &&
          !item.is_system &&
          !features.includes(item.feature_key || '')
        ) {
          return false;
        }
        return true;
      });

      if (allowed.length === 0) return staticNavigation;

      const map = new Map<string, any>();
      allowed.forEach((it) => map.set(it.id, { ...it, submenu: [] }));

      const roots: any[] = [];
      map.forEach((item) => {
        if (item.parent_id && map.has(item.parent_id)) {
          map.get(item.parent_id).submenu.push(item);
        } else {
          roots.push(item);
        }
      });

      const sortItems = (arr: any[]) => {
        arr.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        arr.forEach((i) => i.submenu && sortItems(i.submenu));
      };
      sortItems(roots);

      const convert = (item: any, parentSection?: string): NavItem => {
        const section = item.section ?? parentSection ?? sectionMap.get(item.path) ?? "General";
        return {
          name: item.label,
          href: item.path,
          icon: getIcon(item.icon),
          permission: null,
          section,
          submenu: item.submenu.map((sub: any) => convert(sub, section)),
        };
      };

      return roots.map((r) => convert(r)) as NavItem[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
