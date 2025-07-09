import { supabase } from '../lib/supabase';

export async function checkUserRoles() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.debug('No user logged in');
    return;
  }

  // Get user roles
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select(`
      role:roles (
        id,
        name,
        description
      )
    `)
    .eq('user_id', user.id);

  if (rolesError) {
    console.error('Error fetching roles:', rolesError);
    return;
  }

  console.debug('User Roles:', userRoles?.map(ur => ur.role));

  // Get permissions through role menu items
  if (userRoles?.length) {
    const { data: permissions, error: permissionsError } = await supabase
      .from('user_roles')
      .select(
        `role_menu_items(menu_permissions(permission:permissions(id,code,name,description,module)))`
      )
      .eq('user_id', user.id);

    if (permissionsError) {
      console.error('Error fetching permissions:', permissionsError);
      return;
    }

    const perms = (permissions || [])
      .flatMap(ur => ur.role_menu_items || [])
      .flatMap(rmi => rmi.menu_permissions || [])
      .map(mp => mp.permission);

    console.debug('User Permissions:', perms);
  }}
