/**
 * Debug RLS policies for menu items
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Service role - should bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

// Anon key - subject to RLS
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugRLSPolicies() {
  console.log('🔒 Debugging RLS policies for menu items...\n');
  
  const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';
  
  try {
    // Test 1: Service role access
    console.log('🔑 Testing service role access...');
    const { data: serviceData, error: serviceError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'menu_item')
      .eq('is_active', true);
    
    console.log(`   Service role: ${serviceData?.length || 0} items found`);
    if (serviceError) {
      console.error('   Error:', serviceError);
    }
    
    // Test 2: Anon key access
    console.log('\n🔓 Testing anon key access...');
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'menu_item')
      .eq('is_active', true);
    
    console.log(`   Anon key: ${anonData?.length || 0} items found`);
    if (anonError) {
      console.error('   Error:', anonError);
    }
    
    // Test 3: Test with user authentication
    console.log('\n👤 Testing with user authentication...');
    
    // Try to sign in as a test user
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
      email: 'santhoshlal@gmail.com',
      password: 'password123'
    });
    
    if (authError) {
      console.error('   Auth error:', authError);
    } else {
      console.log('   ✅ User signed in successfully');
      
      // Now try to access menu items as authenticated user
      const { data: authUserData, error: authUserError } = await supabaseAnon
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'menu_item')
        .eq('is_active', true);
      
      console.log(`   Authenticated user: ${authUserData?.length || 0} items found`);
      if (authUserError) {
        console.error('   Error:', authUserError);
      }
    }
    
    // Test 4: Check core_dynamic_data access
    console.log('\n📊 Testing core_dynamic_data access...');
    
    const testEntityId = 'fdecbb43-40d3-4887-a88b-e5261bb5f13b'; // Chapathi ID
    
    // Service role
    const { data: serviceDynamicData, error: serviceDynamicError } = await supabaseAdmin
      .from('core_dynamic_data')
      .select('*')
      .eq('entity_id', testEntityId);
    
    console.log(`   Service role dynamic data: ${serviceDynamicData?.length || 0} records`);
    if (serviceDynamicError) {
      console.error('   Error:', serviceDynamicError);
    }
    
    // Anon/Auth user
    const { data: anonDynamicData, error: anonDynamicError } = await supabaseAnon
      .from('core_dynamic_data')
      .select('*')
      .eq('entity_id', testEntityId);
    
    console.log(`   Anon/Auth user dynamic data: ${anonDynamicData?.length || 0} records`);
    if (anonDynamicError) {
      console.error('   Error:', anonDynamicError);
    }
    
    // Test 5: Suggestions
    console.log('\n💡 Analysis:');
    if (serviceData?.length > 0 && anonData?.length === 0) {
      console.log('   ❌ RLS policies are blocking anon access to core_entities');
      console.log('   🔧 Solution: Add RLS policies to allow menu item access');
    }
    
    if (serviceDynamicData?.length > 0 && anonDynamicData?.length === 0) {
      console.log('   ❌ RLS policies are blocking access to core_dynamic_data');
      console.log('   🔧 Solution: Add RLS policies to allow dynamic data access');
    }
    
    console.log('\n🔧 Suggested RLS policies to add:');
    console.log(`
-- Allow public read access to menu items
CREATE POLICY "Public read access to menu items" ON public.core_entities
    FOR SELECT USING (entity_type IN ('menu_category', 'menu_item'));

-- Allow public read access to menu item dynamic data
CREATE POLICY "Public read access to menu dynamic data" ON public.core_dynamic_data
    FOR SELECT USING (
        entity_id IN (
            SELECT id FROM core_entities 
            WHERE entity_type IN ('menu_category', 'menu_item')
        )
    );
    `);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugRLSPolicies();