-- ===================================================================
-- ADD ROW LEVEL SECURITY POLICIES FOR PRODUCT ENTITIES
-- ===================================================================

-- Products: All authenticated users can read, only managers can modify
CREATE POLICY "All staff can read products"
ON core_entities FOR SELECT
TO authenticated
USING (
  entity_type = 'product' 
  AND organization_id = auth.get_user_organization_id()
);

CREATE POLICY "Only managers can create products"
ON core_entities FOR INSERT
TO authenticated
WITH CHECK (
  entity_type = 'product' 
  AND organization_id = auth.get_user_organization_id()
  AND auth.get_user_role() IN ('admin', 'manager')
);

CREATE POLICY "Only managers can update products"
ON core_entities FOR UPDATE
TO authenticated
USING (
  entity_type = 'product' 
  AND organization_id = auth.get_user_organization_id()
  AND auth.get_user_role() IN ('admin', 'manager')
);

CREATE POLICY "Only managers can delete products"
ON core_entities FOR DELETE
TO authenticated
USING (
  entity_type = 'product' 
  AND organization_id = auth.get_user_organization_id()
  AND auth.get_user_role() IN ('admin', 'manager')
);

-- Product metadata: Similar policies for metadata
CREATE POLICY "All staff can read product metadata"
ON core_metadata FOR SELECT
TO authenticated
USING (
  entity_type = 'product'
  AND organization_id = auth.get_user_organization_id()
);

CREATE POLICY "Only managers can create product metadata"
ON core_metadata FOR INSERT
TO authenticated
WITH CHECK (
  entity_type = 'product'
  AND organization_id = auth.get_user_organization_id()
  AND auth.get_user_role() IN ('admin', 'manager')
);

CREATE POLICY "Only managers can update product metadata"
ON core_metadata FOR UPDATE
TO authenticated
USING (
  entity_type = 'product'
  AND organization_id = auth.get_user_organization_id()
  AND auth.get_user_role() IN ('admin', 'manager')
);

CREATE POLICY "Only managers can delete product metadata"
ON core_metadata FOR DELETE
TO authenticated
USING (
  entity_type = 'product'
  AND organization_id = auth.get_user_organization_id()
  AND auth.get_user_role() IN ('admin', 'manager')
);