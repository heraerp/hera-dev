#!/usr/bin/env node

/**
 * Live Schema Verification Utility
 * Always run this before making database operations to verify actual schema
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function verifySchema() {
  console.log('🔍 VERIFYING LIVE SUPABASE SCHEMA...\n');
  
  const tables = [
    'core_entities',
    'core_organizations', 
    'core_dynamic_data',
    'core_relationships',
    'ai_schema_registry',
    'ai_schema_components',
    'core_users',
    'user_organizations',
    'universal_transactions'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: EXISTS`);
        if (data && data.length > 0) {
          console.log(`   Fields: ${Object.keys(data[0]).join(', ')}`);
        } else {
          console.log(`   Table exists but no data`);
        }
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
    }
    console.log('');
  }
}

// Run verification
verifySchema().catch(console.error);