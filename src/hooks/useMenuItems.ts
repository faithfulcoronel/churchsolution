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
          `id,parent_id,code,label,path,icon,sort_order,is_system,section,menu_permissions(permission_id)`,
        )
        .eq("tenant_id", tenant.id)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      if (!items || items.length === 0) {
        return staticNavigation;
      }

      const { data: featureRows, error: featureError } = await supabase
        .from("license_features")
        .select("feature,licenses(status,expires_at)")
        .eq("tenant_id", tenant.id)
        .is("deleted_at", null);

      if (featureError) throw featureError;
      const today = new Date().toISOString().slice(0, 10);
      const features = (featureRows || [])
        .filter(
          (f) =>
            f.licenses?.status === "active" &&
            (!f.licenses.expires_at || f.licenses.expires_at >= today),
        )
        .map((f) => f.feature);

      let permissionIds: string[] = [];
      if (roleIds.length) {
        const { data: rolePerms, error: rpError } = await supabase
          .from("role_permissions")
          .select("permission_id")
          .in("role_id", roleIds);
        if (rpError) throw rpError;
        permissionIds = rolePerms?.map((rp) => rp.permission_id) || [];
      }

      const allowed = items.filter((item) => {
        const perms =
          (item.menu_permissions as { permission_id: string }[]) || [];
        if (
          perms.length &&
          !perms.some((p) => permissionIds.includes(p.permission_id))
        ) {
          return false;
        }
        if (
          features.length > 0 &&
          !item.is_system &&
          !features.includes(item.code)
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
