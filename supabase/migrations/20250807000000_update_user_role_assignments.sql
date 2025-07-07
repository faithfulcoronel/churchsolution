-- Update role assignment functions to include tenant_id on user_roles entries
-- and to check conflicts using user_id, role_id, and tenant_id.

-- assign_admin_role_to_user now records tenant_id
CREATE OR REPLACE FUNCTION assign_admin_role_to_user(
  p_user_id uuid,
  p_tenant_id uuid
)
RETURNS void
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  admin_role_id uuid;
  member_role_id uuid;
BEGIN
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  IF admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Admin role not found';
  END IF;

  SELECT id INTO member_role_id FROM roles WHERE name = 'member';
  IF member_role_id IS NULL THEN
    RAISE EXCEPTION 'Member role not found';
  END IF;

  INSERT INTO user_roles (user_id, role_id, tenant_id, created_by)
  VALUES (p_user_id, admin_role_id, p_tenant_id, p_user_id)
  ON CONFLICT (user_id, role_id, tenant_id) DO NOTHING;

  INSERT INTO user_roles (user_id, role_id, tenant_id, created_by)
  VALUES (p_user_id, member_role_id, p_tenant_id, p_user_id)
  ON CONFLICT (user_id, role_id, tenant_id) DO NOTHING;

  INSERT INTO tenant_users (tenant_id, user_id, admin_role, created_by)
  VALUES (p_tenant_id, p_user_id, 'tenant_admin', p_user_id)
  ON CONFLICT (tenant_id, user_id)
  DO UPDATE SET admin_role = 'tenant_admin';
END;
$$;

-- handle_new_tenant_registration includes tenant_id in role assignments
CREATE OR REPLACE FUNCTION handle_new_tenant_registration(
  p_user_id uuid,
  p_tenant_name text,
  p_tenant_subdomain text,
  p_tenant_address text,
  p_tenant_contact text,
  p_tenant_email text,
  p_tenant_website text
)
RETURNS uuid
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  new_tenant_id uuid;
  is_first_user boolean;
  admin_role_id uuid;
  member_role_id uuid;
  v_membership_category_id uuid;
  v_status_category_id uuid;
  v_member_id uuid;
BEGIN
  IF p_tenant_subdomain !~ '^[a-z0-9-]+$' THEN
    RAISE EXCEPTION 'Invalid subdomain format';
  END IF;

  IF EXISTS (SELECT 1 FROM tenants WHERE subdomain = p_tenant_subdomain FOR UPDATE) THEN
    RAISE EXCEPTION 'Subdomain is already in use';
  END IF;

  IF EXISTS (SELECT 1 FROM tenants WHERE email = p_tenant_email FOR UPDATE) THEN
    RAISE EXCEPTION 'Email is already in use';
  END IF;

  SELECT COUNT(*) = 1 INTO is_first_user FROM auth.users;
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  SELECT id INTO member_role_id FROM roles WHERE name = 'member';
  IF admin_role_id IS NULL OR member_role_id IS NULL THEN
    RAISE EXCEPTION 'Required roles not found';
  END IF;

  INSERT INTO tenants (
    name, subdomain, address, contact_number, email, website, status,
    subscription_tier, subscription_status, created_by
  ) VALUES (
    p_tenant_name,
    p_tenant_subdomain,
    p_tenant_address,
    p_tenant_contact,
    p_tenant_email,
    p_tenant_website,
    'active',
    CASE WHEN is_first_user THEN 'system' ELSE 'free' END,
    'active',
    p_user_id
  ) RETURNING id INTO new_tenant_id;

  PERFORM create_default_chart_of_accounts_for_tenant(new_tenant_id, p_user_id);

  INSERT INTO tenant_users (
    tenant_id, user_id, admin_role, created_by
  ) VALUES (
    new_tenant_id,
    p_user_id,
    CASE WHEN is_first_user THEN 'super_admin'::admin_role_type ELSE 'tenant_admin'::admin_role_type END,
    p_user_id
  );

  INSERT INTO user_roles (user_id, role_id, tenant_id, created_by)
  VALUES
    (p_user_id, admin_role_id, new_tenant_id, p_user_id),
    (p_user_id, member_role_id, new_tenant_id, p_user_id)
  ON CONFLICT (user_id, role_id, tenant_id) DO NOTHING;

  INSERT INTO membership_type (tenant_id, code, name, is_system, created_by)
  VALUES (new_tenant_id, 'member', 'Member', true, auth.uid())
  RETURNING id INTO v_membership_category_id;

  INSERT INTO membership_type (tenant_id, code, name, is_system, created_by)
  VALUES
    (new_tenant_id, 'non_member', 'Non-Member', true, auth.uid()),
    (new_tenant_id, 'visitor', 'visitor', true, auth.uid());

  INSERT INTO membership_status (tenant_id, code, name, is_system, created_by)
  VALUES (new_tenant_id, 'active', 'Active', true, p_user_id)
  RETURNING id INTO v_status_category_id;

  INSERT INTO membership_status (tenant_id, code, name, is_system, created_by)
  VALUES
    (new_tenant_id, 'inactive', 'Inactive', true, p_user_id),
    (new_tenant_id, 'under_discipline', 'Under Discipline', true, p_user_id),
    (new_tenant_id, 'regular_attender', 'Regular Attender', true, p_user_id),
    (new_tenant_id, 'visitor', 'Visitor', true, p_user_id),
    (new_tenant_id, 'transferred', 'Transferred', true, p_user_id);

  PERFORM copy_default_menu_items_to_tenant(new_tenant_id, p_user_id);

  RETURN new_tenant_id;
END;
$$;

-- complete_member_registration assigns tenant aware roles
CREATE OR REPLACE FUNCTION complete_member_registration(
  p_user_id uuid,
  p_tenant_id uuid,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL
)
RETURNS jsonb
SECURITY DEFINER
SET search_path = auth, public, extensions
LANGUAGE plpgsql
AS $$
DECLARE
  v_email text;
  v_member_role_id uuid;
  v_member_type_id uuid;
  v_status_id uuid;
  v_member_id uuid;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'User % does not exist', p_user_id;
  END IF;

  SELECT id INTO v_member_role_id FROM roles WHERE name = 'member';
  INSERT INTO user_roles (user_id, role_id, tenant_id, created_by)
  VALUES (p_user_id, v_member_role_id, p_tenant_id, p_user_id)
  ON CONFLICT (user_id, role_id, tenant_id) DO NOTHING;

  INSERT INTO tenant_users (tenant_id, user_id, admin_role, created_by)
  VALUES (p_tenant_id, p_user_id, 'member', p_user_id)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_member_type_id
  FROM membership_type
  WHERE tenant_id = p_tenant_id AND code = 'non_member' AND deleted_at IS NULL
  LIMIT 1;

  SELECT id INTO v_status_id
  FROM membership_status
  WHERE tenant_id = p_tenant_id AND code = 'inactive' AND deleted_at IS NULL
  LIMIT 1;

  INSERT INTO members (
    tenant_id,
    first_name,
    last_name,
    email,
    contact_number,
    address,
    membership_type_id,
    membership_status_id,
    membership_date,
    created_by
  ) VALUES (
    p_tenant_id,
    COALESCE(p_first_name, split_part(v_email, '@', 1)),
    COALESCE(p_last_name, ''),
    v_email,
    'Not provided',
    'Not provided',
    v_member_type_id,
    v_status_id,
    CURRENT_DATE,
    p_user_id
  ) RETURNING id INTO v_member_id;

  UPDATE tenant_users
  SET member_id = v_member_id
  WHERE tenant_id = p_tenant_id
    AND user_id = p_user_id;

  RETURN jsonb_build_object(
    'member_id', v_member_id,
    'user_id', p_user_id,
    'email', v_email
  );
END;
$$;

-- Grant execute privileges
GRANT EXECUTE ON FUNCTION assign_admin_role_to_user(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_tenant_registration(uuid, text, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_member_registration(uuid, uuid, text, text) TO authenticated;
