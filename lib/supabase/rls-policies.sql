-- HERA Universal ERP - RLS Policies for Core Tables
-- These policies need to be applied in Supabase Dashboard -> SQL Editor

-- 1. Enable RLS on core tables (if not already enabled)
ALTER TABLE core_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_dynamic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE universal_transactions ENABLE ROW LEVEL SECURITY;

-- 2. Create basic authentication policies for core_organizations
-- Policy for authenticated users to read organizations
CREATE POLICY "Users can read organizations they have access to" ON core_organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Policy for authenticated users to create organizations
CREATE POLICY "Users can create organizations" ON core_organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for authenticated users to update organizations they have access to
CREATE POLICY "Users can update organizations they have access to" ON core_organizations
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND is_active = true
      AND role IN ('admin', 'manager')
    )
  );

-- 3. Create policies for anonymous users (for testing)
-- Policy for anonymous users to read organizations
CREATE POLICY "Anonymous users can read organizations" ON core_organizations
  FOR SELECT
  TO anon
  USING (true);

-- Policy for anonymous users to create organizations
CREATE POLICY "Anonymous users can create organizations" ON core_organizations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy for anonymous users to update organizations
CREATE POLICY "Anonymous users can update organizations" ON core_organizations
  FOR UPDATE
  TO anon
  USING (true);

-- 4. Create policies for core_entities
-- Policy for authenticated users
CREATE POLICY "Users can access entities in their organizations" ON core_entities
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Policy for anonymous users (for testing)
CREATE POLICY "Anonymous users can access entities" ON core_entities
  FOR ALL
  TO anon
  USING (true);

-- 5. Create policies for core_dynamic_data
-- Policy for authenticated users
CREATE POLICY "Users can access dynamic data for entities in their organizations" ON core_dynamic_data
  FOR ALL
  TO authenticated
  USING (
    entity_id IN (
      SELECT id 
      FROM core_entities 
      WHERE organization_id IN (
        SELECT organization_id 
        FROM user_organizations 
        WHERE user_id = auth.uid() 
        AND is_active = true
      )
    )
  );

-- Policy for anonymous users (for testing)
CREATE POLICY "Anonymous users can access dynamic data" ON core_dynamic_data
  FOR ALL
  TO anon
  USING (true);

-- 6. Create policies for core_metadata
-- Policy for authenticated users
CREATE POLICY "Users can access metadata for entities in their organizations" ON core_metadata
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Policy for anonymous users (for testing)
CREATE POLICY "Anonymous users can access metadata" ON core_metadata
  FOR ALL
  TO anon
  USING (true);

-- 7. Create policies for core_relationships
-- Policy for authenticated users
CREATE POLICY "Users can access relationships for entities in their organizations" ON core_relationships
  FOR ALL
  TO authenticated
  USING (
    source_entity_id IN (
      SELECT id 
      FROM core_entities 
      WHERE organization_id IN (
        SELECT organization_id 
        FROM user_organizations 
        WHERE user_id = auth.uid() 
        AND is_active = true
      )
    )
  );

-- Policy for anonymous users (for testing)
CREATE POLICY "Anonymous users can access relationships" ON core_relationships
  FOR ALL
  TO anon
  USING (true);

-- 8. Create policies for universal_transactions
-- Policy for authenticated users
CREATE POLICY "Users can access transactions in their organizations" ON universal_transactions
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Policy for anonymous users (for testing)
CREATE POLICY "Anonymous users can access transactions" ON universal_transactions
  FOR ALL
  TO anon
  USING (true);

-- 9. Create policies for user_organizations
-- Policy for authenticated users to read their own organization memberships
CREATE POLICY "Users can read their own organization memberships" ON user_organizations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for authenticated users to be added to organizations by admins
CREATE POLICY "Admins can manage user organization memberships" ON user_organizations
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND is_active = true
      AND role = 'admin'
    )
  );

-- Policy for anonymous users (for testing)
CREATE POLICY "Anonymous users can access user organizations" ON user_organizations
  FOR ALL
  TO anon
  USING (true);

-- 10. Create policies for core_users
-- Policy for authenticated users to read their own profile
CREATE POLICY "Users can read their own profile" ON core_users
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Policy for authenticated users to update their own profile
CREATE POLICY "Users can update their own profile" ON core_users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Policy for anonymous users (for testing)
CREATE POLICY "Anonymous users can access user profiles" ON core_users
  FOR ALL
  TO anon
  USING (true);

-- Note: After applying these policies, you should be able to:
-- 1. Create organizations as an authenticated user
-- 2. Test functionality with anonymous users during development
-- 3. Switch to proper user-based policies in production by removing anonymous policies

-- To check if policies are working:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('core_organizations', 'core_entities', 'core_dynamic_data', 'core_metadata', 'core_relationships', 'universal_transactions');