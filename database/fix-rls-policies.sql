-- ===================================================================
-- FIX ROW LEVEL SECURITY POLICIES
-- Use user_organizations table instead of JWT claims
-- ===================================================================

-- Drop existing problematic functions and policies
DROP FUNCTION IF EXISTS auth.get_user_organization_id() CASCADE;
DROP POLICY IF EXISTS "Restaurant staff can access their organization entities" ON core_entities;
DROP POLICY IF EXISTS "Restaurant staff can access metadata for their organization" ON core_metadata;
DROP POLICY IF EXISTS "All staff can read products" ON core_entities;
DROP POLICY IF EXISTS "Only managers can create products" ON core_entities;
DROP POLICY IF EXISTS "Only managers can update products" ON core_entities;
DROP POLICY IF EXISTS "Only managers can delete products" ON core_entities;
DROP POLICY IF EXISTS "All staff can read product metadata" ON core_metadata;
DROP POLICY IF EXISTS "Only managers can create product metadata" ON core_metadata;
DROP POLICY IF EXISTS "Only managers can update product metadata" ON core_metadata;
DROP POLICY IF EXISTS "Only managers can delete product metadata" ON core_metadata;

-- Create a simpler function to get user's organizations
CREATE OR REPLACE FUNCTION auth.user_organizations()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT organization_id
  FROM user_organizations
  WHERE user_id = auth.uid()
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a function to check if user has role in any of their organizations
CREATE OR REPLACE FUNCTION auth.user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_organizations
    WHERE user_id = auth.uid()
      AND is_active = true
      AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a function to check if user has role in a specific organization
CREATE OR REPLACE FUNCTION auth.user_has_role_in_org(org_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_organizations
    WHERE user_id = auth.uid()
      AND organization_id = org_id
      AND is_active = true
      AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ===================================================================
-- CORE ENTITIES POLICIES (SIMPLIFIED)
-- ===================================================================

-- Base policy: Users can only access entities in their organizations
CREATE POLICY "Users can access entities in their organizations"
ON core_entities FOR SELECT
TO authenticated
USING (organization_id IN (SELECT auth.user_organizations()));

-- Products: Anyone in the organization can read, managers can modify
CREATE POLICY "Managers can create products"
ON core_entities FOR INSERT
TO authenticated
WITH CHECK (
  entity_type = 'product' 
  AND organization_id IN (SELECT auth.user_organizations())
  AND (
    auth.user_has_role('admin') 
    OR auth.user_has_role('manager')
    OR auth.user_has_role_in_org(organization_id, 'admin')
    OR auth.user_has_role_in_org(organization_id, 'manager')
  )
);

CREATE POLICY "Managers can update products"
ON core_entities FOR UPDATE
TO authenticated
USING (
  entity_type = 'product' 
  AND organization_id IN (SELECT auth.user_organizations())
  AND (
    auth.user_has_role('admin') 
    OR auth.user_has_role('manager')
    OR auth.user_has_role_in_org(organization_id, 'admin')
    OR auth.user_has_role_in_org(organization_id, 'manager')
  )
);

CREATE POLICY "Managers can delete products"
ON core_entities FOR DELETE
TO authenticated
USING (
  entity_type = 'product' 
  AND organization_id IN (SELECT auth.user_organizations())
  AND (
    auth.user_has_role('admin') 
    OR auth.user_has_role('manager')
    OR auth.user_has_role_in_org(organization_id, 'admin')
    OR auth.user_has_role_in_org(organization_id, 'manager')
  )
);

-- ===================================================================
-- CORE METADATA POLICIES (SIMPLIFIED)
-- ===================================================================

-- Base policy: Users can access metadata for entities in their organizations
CREATE POLICY "Users can access metadata in their organizations"
ON core_metadata FOR SELECT
TO authenticated
USING (organization_id IN (SELECT auth.user_organizations()));

-- Product metadata: Managers can modify
CREATE POLICY "Managers can create product metadata"
ON core_metadata FOR INSERT
TO authenticated
WITH CHECK (
  entity_type = 'product'
  AND organization_id IN (SELECT auth.user_organizations())
  AND (
    auth.user_has_role('admin') 
    OR auth.user_has_role('manager')
    OR auth.user_has_role_in_org(organization_id, 'admin')
    OR auth.user_has_role_in_org(organization_id, 'manager')
  )
);

CREATE POLICY "Managers can update product metadata"
ON core_metadata FOR UPDATE
TO authenticated
USING (
  entity_type = 'product'
  AND organization_id IN (SELECT auth.user_organizations())
  AND (
    auth.user_has_role('admin') 
    OR auth.user_has_role('manager')
    OR auth.user_has_role_in_org(organization_id, 'admin')
    OR auth.user_has_role_in_org(organization_id, 'manager')
  )
);

CREATE POLICY "Managers can delete product metadata"
ON core_metadata FOR DELETE
TO authenticated
USING (
  entity_type = 'product'
  AND organization_id IN (SELECT auth.user_organizations())
  AND (
    auth.user_has_role('admin') 
    OR auth.user_has_role('manager')
    OR auth.user_has_role_in_org(organization_id, 'admin')
    OR auth.user_has_role_in_org(organization_id, 'manager')
  )
);

-- ===================================================================
-- TEMPORARY: Allow service role full access (for debugging)
-- ===================================================================

-- This should be removed in production
CREATE POLICY "Service role has full access to entities"
ON core_entities FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role has full access to metadata"
ON core_metadata FOR ALL
TO service_role
USING (true)
WITH CHECK (true);