/**
 * 🔍 Debug UUID Issue in Migration System
 * Identifies where the empty UUID string is coming from
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import crypto from 'crypto'
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

async function debugUUIDIssue() {
  console.log('🔍 Debugging UUID Issue in Migration System')
  console.log('=' .repeat(50))

  try {
    // Step 1: Check current migration mode status
    console.log('📋 Step 1: Checking migration mode status...')
    
    try {
      // Try to get current session info
      const { data: sessionInfo, error: sessionError } = await supabaseAdmin
        .from('pg_stat_activity')
        .select('application_name, usename')
        .limit(1)
      
      if (sessionError) {
        console.log('⚠️ Cannot access session info (expected with RLS)')
      } else {
        console.log('✅ Session info accessible')
      }
    } catch (e) {
      console.log('⚠️ Session query not available')
    }

    // Step 2: Test RPC functions individually
    console.log('\n📋 Step 2: Testing RPC functions...')
    
    try {
      await supabaseAdmin.rpc('set_migration_mode', { 
        user_id: '00000000-0000-0000-0000-000000000001' 
      })
      console.log('✅ set_migration_mode executed successfully')
    } catch (error) {
      console.error('❌ set_migration_mode failed:', error.message)
    }

    try {
      await supabaseAdmin.rpc('clear_migration_mode')
      console.log('✅ clear_migration_mode executed successfully')
    } catch (error) {
      console.error('❌ clear_migration_mode failed:', error.message)
    }

    // Step 3: Check for existing organizations (avoid foreign key issues)
    console.log('\n📋 Step 3: Finding valid organization...')
    
    const { data: orgs, error: orgError } = await supabaseAdmin
      .from('core_organizations')
      .select('id, org_name')
      .limit(1)

    if (orgError) {
      console.error('❌ Cannot access organizations:', orgError.message)
      return
    }

    if (!orgs || orgs.length === 0) {
      console.log('⚠️ No organizations found - creating test organization...')
      
      // Create minimal test setup
      const clientId = crypto.randomUUID()
      const orgId = crypto.randomUUID()
      
      console.log('   Creating test client...')
      const { error: clientError } = await supabaseAdmin
        .from('core_clients')
        .insert({
          id: clientId,
          client_name: 'Migration Test Client',
          client_code: 'TEST-CLIENT-001',
          client_type: 'test',
          is_active: true
        })
      
      if (clientError) {
        console.error('❌ Failed to create test client:', clientError.message)
        return
      }
      console.log('✅ Test client created')

      console.log('   Creating test organization...')
      const { error: orgError } = await supabaseAdmin
        .from('core_organizations')
        .insert({
          id: orgId,
          client_id: clientId,
          org_name: 'Migration Test Org',
          org_code: 'TEST-ORG-001',
          industry: 'testing',
          currency: 'USD',
          country: 'US',
          is_active: true
        })
      
      if (orgError) {
        console.error('❌ Failed to create test organization:', orgError.message)
        return
      }
      console.log('✅ Test organization created')
      
      orgs[0] = { id: orgId, org_name: 'Migration Test Org' }
    }

    const testOrgId = orgs[0].id
    console.log(`✅ Using organization: ${orgs[0].org_name} (${testOrgId})`)

    // Step 4: Test entity creation with detailed error handling
    console.log('\n📋 Step 4: Testing entity creation with error isolation...')
    
    // First, try without any triggers by setting migration mode
    await supabaseAdmin.rpc('set_migration_mode', { 
      user_id: '00000000-0000-0000-0000-000000000001' 
    })
    console.log('✅ Migration mode set with system user')

    // Test with minimal data first
    const testId = crypto.randomUUID()
    console.log(`   Creating entity with ID: ${testId}`)
    console.log(`   Organization ID: ${testOrgId}`)

    const minimalEntity = {
      id: testId,
      organization_id: testOrgId,
      entity_type: 'test_item',
      entity_name: 'Test Item',
      entity_code: 'TEST-001',
      is_active: true
    }

    console.log('   Entity data:', JSON.stringify(minimalEntity, null, 2))

    const { data: result, error: entityError } = await supabaseAdmin
      .from('core_entities')
      .insert(minimalEntity)
      .select()

    if (entityError) {
      console.error('❌ Entity creation failed:', entityError)
      console.error('   Error code:', entityError.code)
      console.error('   Error message:', entityError.message)
      console.error('   Error details:', entityError.details)
      console.error('   Error hint:', entityError.hint)
      
      // Check if it's a trigger-related issue
      if (entityError.message.includes('changed_by')) {
        console.log('\n🔍 This appears to be a trigger/audit trail issue')
        console.log('   The audit trail trigger is trying to use an empty changed_by field')
        console.log('   Even though migration mode is set, the trigger may not be working correctly')
      }
    } else {
      console.log('✅ Entity created successfully!')
      console.log('   Result:', result)
      
      // Clean up test entity
      await supabaseAdmin.from('core_entities').delete().eq('id', testId)
      console.log('✅ Test entity cleaned up')
    }

    // Clear migration mode
    await supabaseAdmin.rpc('clear_migration_mode')
    console.log('✅ Migration mode cleared')

    // Step 5: Check audit trail table structure
    console.log('\n📋 Step 5: Checking audit trail setup...')
    
    try {
      const { data: auditData, error: auditError } = await supabaseAdmin
        .from('core_change_documents')
        .select('*')
        .limit(1)
      
      if (auditError) {
        console.error('❌ Cannot access audit trail:', auditError.message)
      } else {
        console.log('✅ Audit trail table accessible')
        if (auditData && auditData.length > 0) {
          console.log('   Sample audit record fields:', Object.keys(auditData[0]))
        }
      }
    } catch (e) {
      console.error('❌ Audit trail query failed:', e.message)
    }

  } catch (error) {
    console.error('❌ Debug process failed:', error)
  }
}

debugUUIDIssue().catch(console.error)