-- Fix RLS policies for menu items and POS system
-- This allows public read access to menu items and their dynamic data

-- 1. Allow public read access to menu categories and menu items
CREATE POLICY "Public read access to menu items" ON public.core_entities
    FOR SELECT USING (entity_type IN ('menu_category', 'menu_item'));

-- 2. Allow public read access to dynamic data for menu items  
CREATE POLICY "Public read access to menu dynamic data" ON public.core_dynamic_data
    FOR SELECT USING (
        entity_id IN (
            SELECT id FROM core_entities 
            WHERE entity_type IN ('menu_category', 'menu_item')
        )
    );

-- 3. Allow public read access to products (in case POS uses them)
CREATE POLICY "Public read access to products" ON public.core_entities
    FOR SELECT USING (entity_type IN ('product', 'product_category'));

-- 4. Allow public read access to product dynamic data
CREATE POLICY "Public read access to product dynamic data" ON public.core_dynamic_data
    FOR SELECT USING (
        entity_id IN (
            SELECT id FROM core_entities 
            WHERE entity_type IN ('product', 'product_category')
        )
    );

-- 5. Allow public read access to metadata for menu items (optional)
CREATE POLICY "Public read access to menu metadata" ON public.core_metadata
    FOR SELECT USING (
        entity_type IN ('menu_category', 'menu_item', 'product')
    );

-- 6. Allow public write access to orders (so POS can create orders)
CREATE POLICY "Public write access to orders" ON public.universal_transactions
    FOR INSERT WITH CHECK (transaction_type = 'SALES_ORDER');

-- 7. Allow public write access to order lines
CREATE POLICY "Public write access to order lines" ON public.universal_transaction_lines
    FOR INSERT WITH CHECK (true);

-- 8. Allow public read access to existing orders (for kitchen display)
CREATE POLICY "Public read access to orders" ON public.universal_transactions
    FOR SELECT USING (transaction_type = 'SALES_ORDER');

-- 9. Allow public read access to order lines (for kitchen display)
CREATE POLICY "Public read access to order lines" ON public.universal_transaction_lines
    FOR SELECT USING (true);

-- 10. Allow public update access to order status (for kitchen status updates)
CREATE POLICY "Public update access to order status" ON public.universal_transactions
    FOR UPDATE USING (transaction_type = 'SALES_ORDER');

-- 11. Allow public write access to order metadata (for order context)
CREATE POLICY "Public write access to order metadata" ON public.core_metadata
    FOR INSERT WITH CHECK (entity_type = 'transaction');

-- 12. Allow public read access to order metadata (for kitchen display)
CREATE POLICY "Public read access to order metadata" ON public.core_metadata
    FOR SELECT USING (entity_type = 'transaction');

-- Check if policies were created successfully
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('core_entities', 'core_dynamic_data', 'core_metadata', 'universal_transactions', 'universal_transaction_lines')
ORDER BY tablename, policyname;