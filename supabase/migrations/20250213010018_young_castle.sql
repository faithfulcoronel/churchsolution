-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS manage_user(text, uuid, jsonb);

-- Create function to manage users securely
CREATE OR REPLACE FUNCTION manage_user(
  operation text,
  target_user_id uuid DEFAULT NULL,
  user_data jsonb DEFAULT NULL
)
RETURNS jsonb
SECURITY DEFINER
SET search_path = auth, public, extensions
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
  password_hash text;
  new_user_id uuid;
  instance_id uuid;
  member_role_id uuid;
BEGIN
  -- Check if user is admin
  IF NOT (SELECT is_admin()) THEN
    RAISE EXCEPTION 'Only administrators can manage users';
  END IF;

  -- Get the instance ID from an existing user
  SELECT u.instance_id INTO instance_id FROM auth.users u LIMIT 1;
  
  -- If no instance_id found, use the default
  IF instance_id IS NULL THEN
    instance_id := '00000000-0000-0000-0000-000000000000'::uuid;
  END IF;

  CASE operation
    WHEN 'get' THEN
      IF target_user_id IS NULL THEN
        -- Get all users
        SELECT jsonb_agg(jsonb_build_object(
          'id', u.id,
          'email', u.email,
          'created_at', u.created_at,
          'last_sign_in_at', u.last_sign_in_at,
          'raw_user_meta_data', u.raw_user_meta_data,
          'raw_app_meta_data', u.raw_app_meta_data
        ))
        FROM auth.users u
        INTO result;
      ELSE
        -- Get specific user
        SELECT jsonb_build_object(
          'id', u.id,
          'email', u.email,
          'created_at', u.created_at,
          'last_sign_in_at', u.last_sign_in_at,
          'raw_user_meta_data', u.raw_user_meta_data,
          'raw_app_meta_data', u.raw_app_meta_data
        )
        FROM auth.users u
        WHERE u.id = target_user_id
        INTO result;
      END IF;

    WHEN 'create' THEN
      -- Generate new user ID
      SELECT gen_random_uuid() INTO new_user_id;
      
      -- Create password hash using proper method for Supabase Auth
      SELECT crypt(user_data->>'password', gen_salt('bf', 10)) INTO password_hash;
      
      -- Create new user with minimal required columns
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        last_sign_in_at
      )
      VALUES (
        instance_id,
        new_user_id,
        'authenticated',
        'authenticated',
        user_data->>'email',
        password_hash,
        now(), -- Auto-confirm email
        now(),
        now(),
        jsonb_build_object(
          'provider', 'email',
          'providers', ARRAY['email']
        ),
        jsonb_build_object(),
        false,
        now()
      )
      RETURNING jsonb_build_object(
        'id', id,
        'email', email,
        'created_at', created_at
      ) INTO result;

      -- Get the member role ID
      SELECT id INTO member_role_id FROM roles WHERE name = 'member';

      -- Assign member role to the new user
      IF member_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id, created_by)
        VALUES (new_user_id, member_role_id, auth.uid());
      END IF;

      -- Assign any additional roles from user_data
      IF user_data ? 'roles' AND jsonb_array_length(user_data->'roles') > 0 THEN
        INSERT INTO user_roles (user_id, role_id, created_by)
        SELECT 
          new_user_id,
          role_id,
          auth.uid()
        FROM jsonb_array_elements_text(user_data->'roles') AS role_id
        WHERE role_id != member_role_id::text
        ON CONFLICT DO NOTHING;
      END IF;

    WHEN 'update' THEN
      IF user_data->>'password' IS NOT NULL THEN
        -- Update password hash using proper method for Supabase Auth
        SELECT crypt(user_data->>'password', gen_salt('bf', 10)) INTO password_hash;
        
        -- Update user with new password
        UPDATE auth.users
        SET
          encrypted_password = password_hash,
          updated_at = now()
        WHERE id = target_user_id
        RETURNING jsonb_build_object(
          'id', id,
          'email', email,
          'updated_at', updated_at
        ) INTO result;
      ELSE
        -- Update user without changing password
        UPDATE auth.users
        SET
          updated_at = now()
        WHERE id = target_user_id
        RETURNING jsonb_build_object(
          'id', id,
          'email', email,
          'updated_at', updated_at
        ) INTO result;
      END IF;

      -- Update roles if provided
      IF user_data ? 'roles' THEN
        -- Delete existing roles
        DELETE FROM user_roles WHERE user_id = target_user_id;

        -- Get the member role ID
        SELECT id INTO member_role_id FROM roles WHERE name = 'member';

        -- Always ensure member role
        INSERT INTO user_roles (user_id, role_id, created_by)
        VALUES (target_user_id, member_role_id, auth.uid())
        ON CONFLICT DO NOTHING;

        -- Add new roles
        IF jsonb_array_length(user_data->'roles') > 0 THEN
          INSERT INTO user_roles (user_id, role_id, created_by)
          SELECT 
            target_user_id,
            role_id,
            auth.uid()
          FROM jsonb_array_elements_text(user_data->'roles') AS role_id
          WHERE role_id != member_role_id::text
          ON CONFLICT DO NOTHING;
        END IF;
      END IF;

    WHEN 'delete' THEN
      -- Delete user and their roles
      DELETE FROM public.user_roles WHERE user_id = target_user_id;
      DELETE FROM auth.users WHERE id = target_user_id;
      result := jsonb_build_object('success', true);

    ELSE
      RAISE EXCEPTION 'Invalid operation: %', operation;
  END CASE;

  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION manage_user(text, uuid, jsonb) TO authenticated;