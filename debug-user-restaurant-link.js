/**
 * HERA Universal - User-Restaurant Link Diagnostic
 * 
 * This script specifically checks the user-organization link
 * to understand why "No Restaurant Found" persists after setup.
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Service client for admin operations
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

async function diagnoseUserRestaurantLink() {
  console.log('🔍 HERA Universal User-Restaurant Link Diagnostic')
  console.log('=' .repeat(60))

  try {
    // Step 1: Get auth users
    console.log('\n🔐 Step 1: Getting auth users')
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }
    
    console.log(`✅ Found ${authUsers.users.length} auth users`)
    
    // Find the most recent user (likely the one who created "Hera")
    const recentUser = authUsers.users
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    
    if (!recentUser) {
      console.log('❌ No auth users found')
      return
    }
    
    console.log(`🎯 Most recent user: ${recentUser.email} (${recentUser.id})`)
    console.log(`   Created: ${recentUser.created_at}`)
    console.log(`   Last sign in: ${recentUser.last_sign_in_at}`)

    // Step 2: Check if this user has a core_users record
    console.log('\n👤 Step 2: Checking core_users record')
    const { data: coreUser, error: coreUserError } = await supabaseAdmin
      .from('core_users')
      .select('*')
      .eq('auth_user_id', recentUser.id)
      .single()

    if (coreUserError || !coreUser) {
      console.log('❌ No core_users record found for this auth user')
      console.log('   This means user setup was incomplete!')
      
      // Check all core_users to see what exists
      const { data: allCoreUsers } = await supabaseAdmin
        .from('core_users')
        .select('*')
        .order('created_at', { ascending: false })
        
      console.log(`\n📊 All core_users (${allCoreUsers?.length || 0}):`)
      allCoreUsers?.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.full_name} (${user.email})`)
        console.log(`      - Core ID: ${user.id}`)
        console.log(`      - Auth ID: ${user.auth_user_id}`)
        console.log(`      - Active: ${user.is_active}`)
      })
      return
    }

    console.log('✅ Core user found:')
    console.log(`   - Core ID: ${coreUser.id}`)
    console.log(`   - Name: ${coreUser.full_name}`)
    console.log(`   - Email: ${coreUser.email}`)
    console.log(`   - Active: ${coreUser.is_active}`)

    // Step 3: Check user-organization links
    console.log('\n🔗 Step 3: Checking user-organization links')
    const { data: userOrgs, error: userOrgsError } = await supabaseAdmin
      .from('user_organizations')
      .select(`
        *,
        core_organizations (
          id,
          org_name,
          industry,
          client_id,
          is_active
        )
      `)
      .eq('user_id', coreUser.id)

    if (userOrgsError) {
      console.error('❌ Error fetching user-organization links:', userOrgsError)
      return
    }

    if (!userOrgs || userOrgs.length === 0) {
      console.log('❌ No user-organization links found!')
      console.log('   This is the ROOT CAUSE of "No Restaurant Found"')
      
      // Check what organizations exist
      console.log('\n🏢 Available organizations:')
      const { data: allOrgs } = await supabaseAdmin
        .from('core_organizations')
        .select('*')
        .eq('industry', 'restaurant')
        .order('created_at', { ascending: false })
        
      if (allOrgs && allOrgs.length > 0) {
        console.log(`✅ Found ${allOrgs.length} restaurant organization(s):`)
        allOrgs.forEach((org, index) => {
          console.log(`   ${index + 1}. ${org.org_name}`)
          console.log(`      - ID: ${org.id}`)
          console.log(`      - Client ID: ${org.client_id}`)
          console.log(`      - Active: ${org.is_active}`)
          console.log(`      - Created: ${org.created_at}`)
        })
        
        // **FIX ATTEMPT: Create missing user-organization link**
        console.log('\n🔧 ATTEMPTING TO FIX: Creating user-organization link')
        const heraOrg = allOrgs.find(org => org.org_name.toLowerCase().includes('hera'))
        
        if (heraOrg) {
          console.log(`🎯 Creating link between user ${coreUser.full_name} and restaurant ${heraOrg.org_name}`)
          
          const { data: newLink, error: linkError } = await supabaseAdmin
            .from('user_organizations')
            .insert({
              id: crypto.randomUUID(),
              user_id: coreUser.id,
              organization_id: heraOrg.id,
              role: 'owner',
              is_active: true,
              created_at: new Date().toISOString()
            })
            .select()
          
          if (linkError) {
            console.error('❌ Failed to create user-organization link:', linkError)
          } else {
            console.log('✅ Successfully created user-organization link!')
            console.log('🎉 This should fix the "No Restaurant Found" issue')
            console.log('\nPlease refresh your browser and try accessing the dashboard again.')
          }
        } else {
          console.log('❌ No "Hera" restaurant found to link to')
        }
      } else {
        console.log('❌ No restaurant organizations found at all!')
        console.log('   The restaurant setup completely failed')
      }
      
    } else {
      console.log(`✅ Found ${userOrgs.length} user-organization link(s):`)
      userOrgs.forEach((link, index) => {
        console.log(`   ${index + 1}. Organization: ${link.core_organizations?.org_name}`)
        console.log(`      - Role: ${link.role}`)
        console.log(`      - Active: ${link.is_active}`)
        console.log(`      - Industry: ${link.core_organizations?.industry}`)
      })
      
      // Filter for restaurants
      const restaurantLinks = userOrgs.filter(link => 
        link.core_organizations?.industry === 'restaurant' && link.is_active
      )
      
      console.log(`🍽️ Restaurant links: ${restaurantLinks.length}`)
      
      if (restaurantLinks.length === 0) {
        console.log('❌ No active restaurant links found!')
      } else {
        console.log('✅ Restaurant links are properly configured!')
        console.log('   The "No Restaurant Found" issue should be resolved.')
      }
    }

    console.log('\n🎯 DIAGNOSIS COMPLETE')
    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Diagnostic failed:', error)
  }
}

diagnoseUserRestaurantLink()