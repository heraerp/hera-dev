#!/usr/bin/env node

/**
 * 🔍 Quick Schema Check for HERA Universal
 * 
 * Quickly verify database schema before any operations.
 * Run this to ensure Claude CLI works with actual schema, not assumptions.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { createClient } from '@/lib/supabase/client';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

const HERA_TABLES = [
  'core_entities',
  'core_organizations', 
  'core_users',
  'core_metadata',
  'core_dynamic_data',
  'user_organizations',
  'universal_transactions',
  'universal_transaction_lines'
];

async function checkTableSchema(tableName) {
  console.log(`\n📋 ${tableName.toUpperCase()} SCHEMA:`);
  console.log('=' .repeat(40));
  
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');

    if (error) {
      console.error(`❌ Error checking ${tableName}:`, error.message);
      return false;
    }

    if (!data || data.length === 0) {
      console.log(`⚠️  Table '${tableName}' not found!`);
      return false;
    }

    data.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      console.log(`  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(15)} ${nullable}${defaultVal}`);
    });

    return true;

  } catch (error) {
    console.error(`❌ Failed to check ${tableName}:`, error.message);
    return false;
  }
}

async function checkSystemOrganizations() {
  console.log('\n🏗️ HERA SYSTEM ORGANIZATIONS:');
  console.log('=' .repeat(40));
  
  try {
    const { data, error } = await supabase
      .from('core_organizations')
      .select('id, org_name, org_code, client_id')
      .eq('client_id', '00000000-0000-0000-0000-000000000001')
      .order('org_code');

    if (error) {
      console.error('❌ Error checking system organizations:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No HERA system organizations found!');
      console.log('   Run the HERA self-development migration first.');
      return;
    }

    data.forEach(org => {
      console.log(`  ${org.org_code.padEnd(20)} ${org.org_name}`);
    });

  } catch (error) {
    console.error('❌ Failed to check system organizations:', error.message);
  }
}

async function getTableCounts() {
  console.log('\n📊 TABLE RECORD COUNTS:');
  console.log('=' .repeat(30));
  
  for (const tableName of HERA_TABLES) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`  ${tableName.padEnd(25)} ❌ Error: ${error.message}`);
      } else {
        console.log(`  ${tableName.padEnd(25)} ${count || 0} records`);
      }
    } catch (error) {
      console.log(`  ${tableName.padEnd(25)} ❌ Table not found`);
    }
  }
}

async function checkNamingConventions() {
  console.log('\n🎯 NAMING CONVENTION CHECK:');
  console.log('=' .repeat(35));
  
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (error) {
      console.error('❌ Error checking tables:', error.message);
      return;
    }

    const hereaTables = data.filter(t => 
      t.table_name.includes('core_') || 
      t.table_name.includes('universal_') ||
      t.table_name.includes('user_')
    );

    hereaTables.forEach(table => {
      let status = '✅ Good';
      if (table.table_name.startsWith('core_')) {
        status = '✅ Follows core_ pattern';
      } else if (table.table_name.startsWith('universal_')) {
        status = '✅ Follows universal_ pattern';  
      } else if (table.table_name.startsWith('user_')) {
        status = '✅ Follows user_ pattern';
      } else {
        status = '⚠️  Non-standard naming';
      }
      
      console.log(`  ${table.table_name.padEnd(30)} ${status}`);
    });

  } catch (error) {
    console.error('❌ Failed naming convention check:', error.message);
  }
}

async function main() {
  console.log('🔍 HERA UNIVERSAL SCHEMA VERIFICATION');
  console.log('======================================\n');
  
  console.log('🚨 CRITICAL: This verification prevents schema assumption errors!');
  console.log('   Always run this before any database operations.\n');

  // Check if we can connect
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('\n💡 Check your .env.local file:');
      console.log('   - NEXT_PUBLIC_SUPABASE_URL');
      console.log('   - NEXT_PUBLIC_SUPABASE_SERVICE_KEY');
      process.exit(1);
    }
    
    console.log('✅ Database connection successful\n');
    
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    process.exit(1);
  }

  // Check each HERA table
  let missingTables = 0;
  for (const tableName of HERA_TABLES) {
    const exists = await checkTableSchema(tableName);
    if (!exists) missingTables++;
  }

  if (missingTables > 0) {
    console.log(`\n⚠️  ${missingTables} tables not found. Run migrations first.`);
  }

  // Check system organizations
  await checkSystemOrganizations();

  // Get record counts
  await getTableCounts();

  // Check naming conventions
  await checkNamingConventions();

  console.log('\n✅ SCHEMA VERIFICATION COMPLETE!');
  console.log('==================================');
  console.log('\n📝 NEXT STEPS:');
  console.log('1. Use the EXACT column names shown above');
  console.log('2. Never assume schema structure');  
  console.log('3. Verify any new tables before using');
  console.log('4. Follow HERA Universal Naming Convention');
  console.log('\n🚨 REMEMBER: Schema first, then code!');
}

// Handle command line usage
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { checkTableSchema, checkSystemOrganizations, getTableCounts };