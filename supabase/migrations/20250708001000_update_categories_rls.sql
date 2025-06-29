-- Reinstate tenant-scoped RLS policies for categories

-- Remove overly permissive policy
DROP POLICY IF EXISTS "Categories can be managed by authenticated users" ON categories;

-- Ensure clean slate
DROP POLICY IF EXISTS "Categories are viewable by tenant users" ON categories;
DROP POLICY IF EXISTS "Categories can be managed by tenant admins" ON categories;

-- Restrict SELECT to categories within the user's tenant
CREATE POLICY "Categories are viewable by tenant users"
  ON categories FOR SELECT
  TO authenticated
  USING (
    categories.tenant_id IN (
      SELECT tu.tenant_id
      FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
    )
    AND categories.deleted_at IS NULL
  );

-- Allow INSERT, UPDATE, DELETE only for tenant admins
CREATE POLICY "Categories can be managed by tenant admins"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.tenant_id = categories.tenant_id
        AND tu.user_id = auth.uid()
        AND tu.admin_role IN ('super_admin', 'tenant_admin')
    )
    AND categories.deleted_at IS NULL
  );

-- Document intent
COMMENT ON POLICY "Categories are viewable by tenant users" ON categories IS
  'Users can view categories within their tenant';

COMMENT ON POLICY "Categories can be managed by tenant admins" ON categories IS
  'Only tenant admins can manage categories within their tenant';
