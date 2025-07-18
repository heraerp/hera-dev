import { createClient } from '@/lib/supabase/client';
#!/usr/bin/env node

/**
 * Test if the database functions exist
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testFunctions() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  console.log('🔍 Testing database functions...');
  
  // Test 1: Check if functions exist
  console.log('\n1. Checking if functions exist...');
  try {
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname')
      .like('proname', '%test%');
    
    if (error) {
      console.log('❌ Cannot query pg_proc directly');
    } else {
      console.log('✅ Functions found:', data.map(f => f.proname));
    }
  } catch (err) {
    console.log('❌ Error checking functions:', err.message);
  }
  
  // Test 2: Try to call a simple function
  console.log('\n2. Testing simple function call...');
  try {
    const { data, error } = await supabase.rpc('test_core_schema_structure');
    
    if (error) {
      console.log('❌ test_core_schema_structure failed:', error.message);
    } else {
      console.log('✅ test_core_schema_structure works:', data);
    }
  } catch (err) {
    console.log('❌ Error calling test_core_schema_structure:', err.message);
  }
  
  // Test 3: Try to call the main function
  console.log('\n3. Testing main function call...');
  try {
    const { data, error } = await supabase.rpc('run_universal_schema_tests', {
      p_organization_id: '11111111-1111-1111-1111-111111111111',
      p_executed_by: null
    });
    
    if (error) {
      console.log('❌ run_universal_schema_tests failed:', error.message);
    } else {
      console.log('✅ run_universal_schema_tests works:', data);
    }
  } catch (err) {
    console.log('❌ Error calling run_universal_schema_tests:', err.message);
  }
  
  // Test 4: Check if core tables exist
  console.log('\n4. Checking core tables...');
  try {
    const { data, error } = await supabase
      .from('core_entities')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ core_entities table access failed:', error.message);
    } else {
      console.log('✅ core_entities table accessible');
    }
  } catch (err) {
    console.log('❌ Error accessing core_entities:', err.message);
  }
  
  // Test 5: Check if test organization exists
  console.log('\n5. Checking test organization...');
  try {
    const { data, error } = await supabase
      .from('core_organizations')
      .select('*')
      .eq('id', '11111111-1111-1111-1111-111111111111');
    
    if (error) {
      console.log('❌ core_organizations query failed:', error.message);
    } else {
      console.log('✅ Test organization:', data);
    }
  } catch (err) {
    console.log('❌ Error checking test organization:', err.message);
  }
}

testFunctions().catch(console.error);