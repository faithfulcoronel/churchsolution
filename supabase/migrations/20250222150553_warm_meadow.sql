-- Drop existing storage policies
DROP POLICY IF EXISTS "Profile pictures are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

-- Create storage bucket for profile pictures if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Create improved storage policies for profile pictures
CREATE POLICY "Profile pictures are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload profile pictures"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = (
      SELECT tenant_id::text
      FROM tenant_users
      WHERE user_id = auth.uid()
      LIMIT 1
    ) AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Users can update their profile pictures"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = (
      SELECT tenant_id::text
      FROM tenant_users
      WHERE user_id = auth.uid()
      LIMIT 1
    ) AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Users can delete their profile pictures"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = (
      SELECT tenant_id::text
      FROM tenant_users
      WHERE user_id = auth.uid()
      LIMIT 1
    ) AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Add helpful comments
COMMENT ON POLICY "Profile pictures are publicly accessible" ON storage.objects IS
  'Allow public access to all profile pictures';

COMMENT ON POLICY "Users can upload profile pictures" ON storage.objects IS
  'Allow users to upload profile pictures only to their tenant/user folder';

COMMENT ON POLICY "Users can update their profile pictures" ON storage.objects IS
  'Allow users to update only their own profile pictures within their tenant';

COMMENT ON POLICY "Users can delete their profile pictures" ON storage.objects IS
  'Allow users to delete only their own profile pictures within their tenant';