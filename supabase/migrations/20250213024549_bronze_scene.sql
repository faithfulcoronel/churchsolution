-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS update_databases_updated_at ON databases;
DROP FUNCTION IF EXISTS validate_database_connection() CASCADE;
DROP FUNCTION IF EXISTS validate_connection_string(database_connection_type, text) CASCADE;
DROP FUNCTION IF EXISTS check_database_connection(uuid) CASCADE;
DROP TABLE IF EXISTS databases CASCADE;
DROP TYPE IF EXISTS database_connection_type CASCADE;
DROP TYPE IF EXISTS database_status CASCADE;

-- Create enum for database connection types
CREATE TYPE database_connection_type AS ENUM (
  'postgresql',
  'mysql',
  'sqlserver',
  'oracle'
);

-- Create enum for database status
CREATE TYPE database_status AS ENUM (
  'active',
  'inactive',
  'error'
);

-- Create databases table with improved structure
CREATE TABLE IF NOT EXISTS databases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  connection_type database_connection_type NOT NULL,
  connection_string text NOT NULL,
  status database_status NOT NULL DEFAULT 'inactive',
  last_checked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  CONSTRAINT valid_connection_string CHECK (
    connection_string ~ '^[A-Za-z0-9+._:@/-]+$' AND
    length(connection_string) >= 10
  )
);

-- Enable RLS
ALTER TABLE databases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies with better security
CREATE POLICY "Databases are viewable by users with database.view permission"
  ON databases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND (p.code = 'database.view' OR p.code = 'database.create' OR p.code = 'database.delete')
    )
  );

CREATE POLICY "Databases can be created by users with database.create permission"
  ON databases FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.code = 'database.create'
    )
  );

CREATE POLICY "Databases can be updated by users with database.create permission"
  ON databases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.code = 'database.create'
    )
  );

CREATE POLICY "Databases can be deleted by users with database.delete permission"
  ON databases FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = auth.uid()
      AND p.code = 'database.delete'
    )
    -- Only allow deletion if there is more than one database
    AND (SELECT COUNT(*) FROM databases) > 1
  );

-- Create updated_at trigger
CREATE TRIGGER update_databases_updated_at
  BEFORE UPDATE ON databases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create function to validate connection string
CREATE OR REPLACE FUNCTION validate_connection_string(
  conn_type database_connection_type,
  conn_string text
) RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  CASE conn_type
    WHEN 'postgresql' THEN
      RETURN conn_string ~ '^postgresql://[^:]+:[^@]+@[^:]+:\d+/[^?]+$';
    WHEN 'mysql' THEN
      RETURN conn_string ~ '^mysql://[^:]+:[^@]+@[^:]+:\d+/[^?]+$';
    WHEN 'sqlserver' THEN
      RETURN conn_string ~ '^sqlserver://[^:]+:[^@]+@[^:]+:\d+/[^?]+$';
    WHEN 'oracle' THEN
      RETURN conn_string ~ '^oracle://[^:]+:[^@]+@[^:]+:\d+/[^?]+$';
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Create trigger to validate connection string before insert/update
CREATE OR REPLACE FUNCTION validate_database_connection()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT validate_connection_string(NEW.connection_type, NEW.connection_string) THEN
    RAISE EXCEPTION 'Invalid connection string format for connection type %', NEW.connection_type;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_database_connection_trigger
  BEFORE INSERT OR UPDATE ON databases
  FOR EACH ROW
  EXECUTE FUNCTION validate_database_connection();

-- Create function to check database connection
CREATE OR REPLACE FUNCTION check_database_connection(database_id uuid)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  db_record databases%ROWTYPE;
  can_connect boolean;
BEGIN
  -- Get database record
  SELECT * INTO db_record FROM databases WHERE id = database_id;
  
  -- Update last checked time
  UPDATE databases 
  SET 
    last_checked_at = now(),
    status = CASE 
      WHEN can_connect THEN 'active'::database_status
      ELSE 'error'::database_status
    END
  WHERE id = database_id;
  
  RETURN can_connect;
EXCEPTION
  WHEN OTHERS THEN
    -- Update status to error on exception
    UPDATE databases 
    SET 
      last_checked_at = now(),
      status = 'error'::database_status
    WHERE id = database_id;
    
    RETURN false;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_database_connection(uuid) TO authenticated;