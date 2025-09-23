-- Run this SQL in your Supabase SQL Editor to fix data insertion issues

-- 1. First, check if the users table exists
SELECT * FROM information_schema.tables WHERE table_name = 'users';

-- 2. Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Disable Row Level Security temporarily for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 4. Grant permissions to anonymous users (for mobile app)
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;

-- 5. Verify permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='users';

-- 6. Insert a test record to verify everything works
INSERT INTO users (name, phone, latitude, longitude) 
VALUES ('Test User', '+1234567890', 28.6139, 77.2090);

-- 7. Check if the test record was inserted
SELECT * FROM users WHERE name = 'Test User';

-- 4. Grant permissions for anonymous users to insert data
GRANT INSERT ON users TO anon;
GRANT SELECT ON users TO anon;

-- 5. If you want to enable RLS later with proper policies, use this:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert data
-- CREATE POLICY "Allow public insert" ON users
--   FOR INSERT TO public
--   WITH CHECK (true);

-- Create a policy that allows anyone to read data
-- CREATE POLICY "Allow public select" ON users
--   FOR SELECT TO public
--   USING (true);

-- 6. Check current policies (if any)
SELECT * FROM pg_policies WHERE tablename = 'users';
