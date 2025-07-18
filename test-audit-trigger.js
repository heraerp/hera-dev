/**
 * 🔍 Test Audit Trail Trigger Behavior
 * Check if the audit trail trigger is working correctly with migration mode
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { createClient } from '@/lib/supabase/client';

// Load environment variables
config({ path: '.env.local' })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY}`
      }
    }
  }
)

async function testAuditTrigger() {
  console.log('🔍 Testing Audit Trail Trigger Behavior')
  console.log('=' .repeat(50))

  try {
    // Step 1: Check if the migration context functions exist
    console.log('📋 Step 1: Checking migration context functions...')
    
    // Try to verify RPC functions exist by calling them
    try {
      await supabaseAdmin.rpc('set_migration_mode', { user_id: '00000000-0000-0000-0000-000000000001' })
      await supabaseAdmin.rpc('clear_migration_mode')
      console.log('✅ RPC functions are available and working')
    } catch (rpcError) {
      console.log('⚠️ RPC function test failed:', rpcError.message)
    }

    // Step 2: Test trigger behavior by checking session context
    console.log('\n📋 Step 2: Testing session context behavior...')
    
    // Set migration mode first
    await supabaseAdmin.rpc('set_migration_mode', { 
      user_id: '00000000-0000-0000-0000-000000000001' 
    })
    console.log('✅ Migration mode set')

    // Try to check if the context is properly set
    try {
      const { data: contextCheck } = await supabaseAdmin
        .rpc('current_setting', { setting_name: 'app.migration_user_id', missing_ok: true })
      
      console.log('   Migration context value:', contextCheck)
    } catch (e) {
      console.log('⚠️ Could not check migration context:', e.message)
    }

    // Step 3: Check the structure of the audit table
    console.log('\n📋 Step 3: Checking audit table structure...')
    
    // Get a sample record to see the fields
    const { data: sampleAudit, error: auditError } = await supabaseAdmin
      .from('core_change_documents')
      .select('*')
      .limit(1)

    if (auditError) {
      console.log('⚠️ Cannot access audit table:', auditError.message)
    } else if (sampleAudit && sampleAudit.length > 0) {
      console.log('✅ Audit table accessible')
      const fields = Object.keys(sampleAudit[0])
      console.log('   Available fields:', fields)
      
      // Check specifically for changed_by and changed_by_type fields
      if (fields.includes('changed_by')) {
        console.log('   ✅ changed_by field exists')
        console.log('   Sample changed_by value:', sampleAudit[0].changed_by)
      }
      if (fields.includes('changed_by_type')) {
        console.log('   ✅ changed_by_type field exists')
        console.log('   Sample changed_by_type value:', sampleAudit[0].changed_by_type)
      }
    } else {
      console.log('⚠️ No audit records found (table might be empty)')
    }

    // Step 4: Test the actual issue - try direct audit record creation
    console.log('\n📋 Step 4: Testing direct audit record creation...')
    
    try {
      const testAuditRecord = {
        table_name: 'core_entities',
        record_id: '00000000-0000-0000-0000-000000000001',
        operation: 'INSERT',
        changed_by: '00000000-0000-0000-0000-000000000001', // Explicit UUID
        changed_by_type: 'system',
        old_values: null,
        new_values: { test: 'data' }
      }

      const { error: auditInsertError } = await supabaseAdmin
        .from('core_change_documents')
        .insert(testAuditRecord)

      if (auditInsertError) {
        console.error('❌ Direct audit insert failed:', auditInsertError.message)
        
        // Try without changed_by to see if it defaults correctly
        console.log('   Trying without explicit changed_by...')
        const { error: auditInsertError2 } = await supabaseAdmin
          .from('core_change_documents')
          .insert({
            table_name: 'core_entities',
            record_id: '00000000-0000-0000-0000-000000000002',
            operation: 'INSERT',
            changed_by_type: 'system',
            old_values: null,
            new_values: { test: 'data2' }
          })

        if (auditInsertError2) {
          console.error('❌ Audit insert without changed_by also failed:', auditInsertError2.message)
        } else {
          console.log('✅ Audit insert succeeded without explicit changed_by')
        }
      } else {
        console.log('✅ Direct audit insert succeeded')
      }
    } catch (e) {
      console.error('❌ Audit test failed:', e.message)
    }

    // Clear migration mode
    await supabaseAdmin.rpc('clear_migration_mode')
    console.log('\n✅ Migration mode cleared')

    // Step 5: Recommendations
    console.log('\n📋 Step 5: Diagnosis and Recommendations...')
    
    console.log('🔍 DIAGNOSIS:')
    console.log('   The error "invalid input syntax for type uuid: \"\""" suggests:')
    console.log('   1. A database trigger is receiving an empty string for a UUID field')
    console.log('   2. This is likely the audit trail trigger on core_entities')
    console.log('   3. The trigger may not be properly using the migration context')
    console.log('')
    console.log('💡 RECOMMENDATIONS:')
    console.log('   1. Verify the audit trigger is updated with the new SQL improvements')
    console.log('   2. Check that changed_by_type field exists and defaults properly')
    console.log('   3. Ensure migration mode context is properly read by triggers')
    console.log('   4. Consider bypassing audit trail during migration if needed')

  } catch (error) {
    console.error('❌ Audit trigger test failed:', error)
  }
}

testAuditTrigger().catch(console.error)