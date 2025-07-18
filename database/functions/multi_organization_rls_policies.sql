-- ============================================================================
-- HERA Universal Multi-Organization Row Level Security (RLS) Policies
-- Advanced RLS policies that work with multi-organization functions
-- Following HERA Universal Architecture Principles
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to get current user's auth ID
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to organization
CREATE OR REPLACE FUNCTION public.user_has_org_access(
    p_organization_id UUID,
    p_permission_level TEXT DEFAULT 'read'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_access BOOLEAN;
BEGIN
    SELECT has_access INTO v_has_access
    FROM public.check_organization_access(auth.uid(), p_organization_id, p_permission_level);
    
    RETURN COALESCE(v_has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's organizations
CREATE OR REPLACE FUNCTION public.get_user_organization_ids()
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT organization_id
        FROM user_organizations
        WHERE user_id = auth.uid()
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DROP EXISTING POLICIES (if any)
-- ============================================================================

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON core_clients;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON core_organizations;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON core_entities;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON core_dynamic_data;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON core_metadata;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON core_users;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON user_clients;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON user_organizations;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON universal_transactions;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON universal_transaction_lines;

-- ============================================================================
-- CORE CLIENTS POLICIES
-- ============================================================================

-- Users can view clients they have access to through organizations
CREATE POLICY "Users can view accessible clients" ON core_clients
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        id IN (
            SELECT DISTINCT co.client_id
            FROM core_organizations co
            JOIN user_organizations uo ON co.id = uo.organization_id
            WHERE uo.user_id = auth.uid()
            AND uo.is_active = true
        )
    );

-- Only system admin can create clients
CREATE POLICY "Admin can create clients" ON core_clients
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM core_users cu 
            WHERE cu.auth_user_id = auth.uid() 
            AND cu.role = 'admin'
        )
    );

-- Users with admin role in any organization of a client can update client
CREATE POLICY "Admin can update clients" ON core_clients
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        id IN (
            SELECT DISTINCT co.client_id
            FROM core_organizations co
            JOIN user_organizations uo ON co.id = uo.organization_id
            WHERE uo.user_id = auth.uid()
            AND uo.role IN ('owner', 'admin')
            AND uo.is_active = true
        )
    );

-- ============================================================================
-- CORE ORGANIZATIONS POLICIES
-- ============================================================================

-- Users can view organizations they have access to
CREATE POLICY "Users can view accessible organizations" ON core_organizations
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        id IN (
            SELECT uo.organization_id
            FROM user_organizations uo
            WHERE uo.user_id = auth.uid()
            AND uo.is_active = true
        )
    );

-- Users with admin role can create organizations in their clients
CREATE POLICY "Admin can create organizations" ON core_organizations
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        client_id IN (
            SELECT DISTINCT co.client_id
            FROM core_organizations co
            JOIN user_organizations uo ON co.id = uo.organization_id
            WHERE uo.user_id = auth.uid()
            AND uo.role IN ('owner', 'admin')
            AND uo.is_active = true
        )
    );

-- Users with admin role can update organizations
CREATE POLICY "Admin can update organizations" ON core_organizations
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        public.user_has_org_access(id, 'admin')
    );

-- ============================================================================
-- CORE ENTITIES POLICIES
-- ============================================================================

-- Users can view entities in their organizations
CREATE POLICY "Users can view org entities" ON core_entities
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        (
            organization_id IS NULL OR
            organization_id IN (SELECT unnest(public.get_user_organization_ids()))
        )
    );

-- Users with write permission can create entities
CREATE POLICY "Users can create entities" ON core_entities
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        (
            organization_id IS NULL OR
            public.user_has_org_access(organization_id, 'write')
        )
    );

-- Users with write permission can update entities
CREATE POLICY "Users can update entities" ON core_entities
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        (
            organization_id IS NULL OR
            public.user_has_org_access(organization_id, 'write')
        )
    );

-- Users with delete permission can delete entities
CREATE POLICY "Users can delete entities" ON core_entities
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        organization_id IS NOT NULL AND
        public.user_has_org_access(organization_id, 'delete')
    );

-- ============================================================================
-- CORE DYNAMIC DATA POLICIES
-- ============================================================================

-- Users can view dynamic data for entities they have access to
CREATE POLICY "Users can view accessible dynamic data" ON core_dynamic_data
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        entity_id IN (
            SELECT ce.id
            FROM core_entities ce
            WHERE ce.organization_id IS NULL OR
            ce.organization_id IN (SELECT unnest(public.get_user_organization_ids()))
        )
    );

-- Users with write permission can create dynamic data
CREATE POLICY "Users can create dynamic data" ON core_dynamic_data
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        entity_id IN (
            SELECT ce.id
            FROM core_entities ce
            WHERE ce.organization_id IS NULL OR
            public.user_has_org_access(ce.organization_id, 'write')
        )
    );

-- Users with write permission can update dynamic data
CREATE POLICY "Users can update dynamic data" ON core_dynamic_data
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        entity_id IN (
            SELECT ce.id
            FROM core_entities ce
            WHERE ce.organization_id IS NULL OR
            public.user_has_org_access(ce.organization_id, 'write')
        )
    );

-- Users with delete permission can delete dynamic data
CREATE POLICY "Users can delete dynamic data" ON core_dynamic_data
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        entity_id IN (
            SELECT ce.id
            FROM core_entities ce
            WHERE ce.organization_id IS NOT NULL AND
            public.user_has_org_access(ce.organization_id, 'delete')
        )
    );

-- ============================================================================
-- CORE METADATA POLICIES
-- ============================================================================

-- Users can view metadata for their organizations
CREATE POLICY "Users can view org metadata" ON core_metadata
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        (
            organization_id IS NULL OR
            organization_id IN (SELECT unnest(public.get_user_organization_ids()))
        )
    );

-- Users with write permission can create metadata
CREATE POLICY "Users can create metadata" ON core_metadata
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        (
            organization_id IS NULL OR
            public.user_has_org_access(organization_id, 'write')
        )
    );

-- Users with write permission can update metadata
CREATE POLICY "Users can update metadata" ON core_metadata
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        (
            organization_id IS NULL OR
            public.user_has_org_access(organization_id, 'write')
        )
    );

-- Users with delete permission can delete metadata
CREATE POLICY "Users can delete metadata" ON core_metadata
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        organization_id IS NOT NULL AND
        public.user_has_org_access(organization_id, 'delete')
    );

-- ============================================================================
-- CORE USERS POLICIES
-- ============================================================================

-- Users can view their own profile and other users in their organizations
CREATE POLICY "Users can view accessible users" ON core_users
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        (
            auth_user_id = auth.uid() OR
            auth_user_id IN (
                SELECT DISTINCT uo2.user_id
                FROM user_organizations uo1
                JOIN user_organizations uo2 ON uo1.organization_id = uo2.organization_id
                WHERE uo1.user_id = auth.uid()
                AND uo1.is_active = true
                AND uo2.is_active = true
            )
        )
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON core_users
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        auth_user_id = auth.uid()
    );

-- System can create users
CREATE POLICY "System can create users" ON core_users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- USER ORGANIZATIONS POLICIES
-- ============================================================================

-- Users can view their own organization relationships
CREATE POLICY "Users can view own org relationships" ON user_organizations
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        user_id = auth.uid()
    );

-- Admins can view all relationships in their organizations
CREATE POLICY "Admins can view org relationships" ON user_organizations
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        organization_id IN (
            SELECT uo.organization_id
            FROM user_organizations uo
            WHERE uo.user_id = auth.uid()
            AND uo.role IN ('owner', 'admin')
            AND uo.is_active = true
        )
    );

-- Admins can create user-organization relationships
CREATE POLICY "Admins can create user org relationships" ON user_organizations
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        public.user_has_org_access(organization_id, 'admin')
    );

-- Admins can update user-organization relationships
CREATE POLICY "Admins can update user org relationships" ON user_organizations
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        public.user_has_org_access(organization_id, 'admin')
    );

-- ============================================================================
-- UNIVERSAL TRANSACTIONS POLICIES
-- ============================================================================

-- Users can view transactions in their organizations
CREATE POLICY "Users can view org transactions" ON universal_transactions
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        organization_id IN (SELECT unnest(public.get_user_organization_ids()))
    );

-- Users with write permission can create transactions
CREATE POLICY "Users can create transactions" ON universal_transactions
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        public.user_has_org_access(organization_id, 'write')
    );

-- Users with write permission can update transactions
CREATE POLICY "Users can update transactions" ON universal_transactions
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        public.user_has_org_access(organization_id, 'write')
    );

-- Users with delete permission can delete transactions
CREATE POLICY "Users can delete transactions" ON universal_transactions
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        public.user_has_org_access(organization_id, 'delete')
    );

-- ============================================================================
-- UNIVERSAL TRANSACTION LINES POLICIES
-- ============================================================================

-- Users can view transaction lines for accessible transactions
CREATE POLICY "Users can view accessible transaction lines" ON universal_transaction_lines
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        transaction_id IN (
            SELECT ut.id
            FROM universal_transactions ut
            WHERE ut.organization_id IN (SELECT unnest(public.get_user_organization_ids()))
        )
    );

-- Users with write permission can create transaction lines
CREATE POLICY "Users can create transaction lines" ON universal_transaction_lines
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        transaction_id IN (
            SELECT ut.id
            FROM universal_transactions ut
            WHERE public.user_has_org_access(ut.organization_id, 'write')
        )
    );

-- Users with write permission can update transaction lines
CREATE POLICY "Users can update transaction lines" ON universal_transaction_lines
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        transaction_id IN (
            SELECT ut.id
            FROM universal_transactions ut
            WHERE public.user_has_org_access(ut.organization_id, 'write')
        )
    );

-- Users with delete permission can delete transaction lines
CREATE POLICY "Users can delete transaction lines" ON universal_transaction_lines
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        transaction_id IN (
            SELECT ut.id
            FROM universal_transactions ut
            WHERE public.user_has_org_access(ut.organization_id, 'delete')
        )
    );

-- ============================================================================
-- GRANT PERMISSIONS FOR HELPER FUNCTIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.get_current_user_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_org_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_organization_ids TO authenticated;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'HERA Universal Multi-Organization RLS Policies created successfully!';
    RAISE NOTICE 'RLS policies now support multi-organization access control';
    RAISE NOTICE 'Helper functions created: get_current_user_id, user_has_org_access, get_user_organization_ids';
    RAISE NOTICE 'All policies follow principle of least privilege';
    RAISE NOTICE 'Users can only access data in organizations they belong to';
    RAISE NOTICE 'Permission levels: read, write, delete, admin, owner';
END $$;