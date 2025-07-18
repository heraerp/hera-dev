-- Add RLS policies for ingredients to allow recipe management access
-- This allows public read access to ingredient entities and their metadata

-- 1. Allow public read access to ingredient entities
CREATE POLICY "Public read access to ingredients" ON public.core_entities
    FOR SELECT USING (entity_type = 'ingredient' AND is_active = true);

-- 2. Allow public read access to ingredient metadata
CREATE POLICY "Public read access to ingredient metadata" ON public.core_metadata
    FOR SELECT USING (
        entity_type = 'ingredient' AND 
        entity_id IN (
            SELECT id FROM core_entities 
            WHERE entity_type = 'ingredient' AND is_active = true
        )
    );

-- 3. Allow public write access to ingredient entities (for creating new ingredients)
CREATE POLICY "Public write access to ingredients" ON public.core_entities
    FOR INSERT WITH CHECK (entity_type = 'ingredient');

-- 4. Allow public write access to ingredient metadata
CREATE POLICY "Public write access to ingredient metadata" ON public.core_metadata
    FOR INSERT WITH CHECK (
        entity_type = 'ingredient' AND
        metadata_type IN ('ingredient_details', 'inventory_info')
    );

-- 5. Allow public read access to recipe entities
CREATE POLICY "Public read access to recipes" ON public.core_entities
    FOR SELECT USING (entity_type = 'recipe' AND is_active = true);

-- 6. Allow public read access to recipe metadata
CREATE POLICY "Public read access to recipe metadata" ON public.core_metadata
    FOR SELECT USING (
        entity_type = 'recipe' AND 
        entity_id IN (
            SELECT id FROM core_entities 
            WHERE entity_type = 'recipe' AND is_active = true
        )
    );

-- 7. Allow public write access to recipe entities
CREATE POLICY "Public write access to recipes" ON public.core_entities
    FOR INSERT WITH CHECK (entity_type = 'recipe');

-- 8. Allow public write access to recipe metadata
CREATE POLICY "Public write access to recipe metadata" ON public.core_metadata
    FOR INSERT WITH CHECK (
        entity_type = 'recipe' AND
        metadata_type IN ('recipe_details', 'cost_analysis')
    );

-- 9. Allow public read access to recipe ingredients
CREATE POLICY "Public read access to recipe ingredients" ON public.core_entities
    FOR SELECT USING (entity_type = 'recipe_ingredient' AND is_active = true);

-- 10. Allow public read access to recipe ingredient metadata
CREATE POLICY "Public read access to recipe ingredient metadata" ON public.core_metadata
    FOR SELECT USING (
        entity_type = 'recipe_ingredient' AND 
        entity_id IN (
            SELECT id FROM core_entities 
            WHERE entity_type = 'recipe_ingredient' AND is_active = true
        )
    );

-- 11. Allow public write access to recipe ingredients
CREATE POLICY "Public write access to recipe ingredients" ON public.core_entities
    FOR INSERT WITH CHECK (entity_type = 'recipe_ingredient');

-- 12. Allow public write access to recipe ingredient metadata
CREATE POLICY "Public write access to recipe ingredient metadata" ON public.core_metadata
    FOR INSERT WITH CHECK (
        entity_type = 'recipe_ingredient' AND
        metadata_type = 'ingredient_details'
    );

-- Check if policies were created successfully
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('core_entities', 'core_metadata')
  AND policyname LIKE '%ingredient%' OR policyname LIKE '%recipe%'
ORDER BY tablename, policyname;