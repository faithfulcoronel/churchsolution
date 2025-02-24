-- Drop existing RLS policies for members
DROP POLICY IF EXISTS "Members are viewable by authenticated users" ON members;
DROP POLICY IF EXISTS "Members can be created by authenticated users" ON members;
DROP POLICY IF EXISTS "Members can be updated by authenticated users" ON members;
DROP POLICY IF EXISTS "Members can be deleted by authenticated users" ON members;

-- Create improved RLS policies for members with better tenant isolation
CREATE POLICY "Members are viewable by authenticated users"
  ON members FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Members can be created by authenticated users"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can be updated by authenticated users"
  ON members FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Members can be deleted by authenticated users"
  ON members FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- Create function to get member with tenant check
CREATE OR REPLACE FUNCTION get_member_with_tenant_check(
  p_member_id uuid,
  p_tenant_id uuid
)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  middle_name text,
  preferred_name text,
  contact_number text,
  address text,
  email text,
  envelope_number text,
  membership_type membership_type,
  status member_status,
  membership_date date,
  birthday date,
  profile_picture_url text,
  tenant_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  gender gender_type,
  marital_status marital_status_type,
  baptism_date date,
  spiritual_gifts text[],
  ministry_interests text[],
  emergency_contact_name text,
  emergency_contact_phone text,
  leadership_position text,
  small_groups text[],
  ministries text[],
  volunteer_roles text[],
  attendance_rate numeric,
  last_attendance_date date,
  pastoral_notes text,
  prayer_requests text[]
)
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Check if user has access to tenant
  IF NOT EXISTS (
    SELECT 1 FROM tenant_users
    WHERE tenant_id = p_tenant_id
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT m.*
  FROM members m
  WHERE m.id = p_member_id
  AND m.tenant_id = p_tenant_id
  AND m.deleted_at IS NULL;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_member_with_tenant_check(uuid, uuid) TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION get_member_with_tenant_check IS
  'Retrieves a member record with proper tenant access check';