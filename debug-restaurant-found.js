/**
 * HERA Universal - Restaurant Data Diagnostic Script
 * 
 * This script diagnoses why the "No Restaurant Found" error persists
 * even after the user successfully creates a restaurant.
 */

import { createClient } from '@/lib/supabase/client';
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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

async function diagnoseRestaurantData() {
  console.log('🔍 HERA Universal Restaurant Data Diagnostic')
  console.log('=' .repeat(50))

  try {
    // Step 1: Check all created restaurants
    console.log('\n📊 Step 1: All restaurants in system')
    const { data: allOrgs, error: allOrgsError } = await supabaseAdmin
      .from('core_organizations')
      .select('*')
      .eq('industry', 'restaurant')
      .order('created_at', { ascending: false })

    if (allOrgsError) {
      console.error('❌ Error fetching all restaurants:', allOrgsError)
      return
    }

    console.log(`✅ Found ${allOrgs?.length || 0} restaurant organizations:`)
    allOrgs?.forEach((org, index) => {
      console.log(`   ${index + 1}. ${org.org_name} (ID: ${org.id})`)
      console.log(`      - Client ID: ${org.client_id}`)
      console.log(`      - Active: ${org.is_active}`)
      console.log(`      - Created: ${org.created_at}`)
    })

    // Step 2: Check all users
    console.log('\n👥 Step 2: All users in core_users')
    const { data: allUsers, error: allUsersError } = await supabaseAdmin
      .from('core_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (allUsersError) {
      console.error('❌ Error fetching users:', allUsersError)
      return
    }

    console.log(`✅ Found ${allUsers?.length || 0} core users:`)
    allUsers?.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.user_name || 'Unnamed'} (ID: ${user.id})`)
      console.log(`      - Auth User ID: ${user.auth_user_id}`)
      console.log(`      - Email: ${user.email}`)
      console.log(`      - Active: ${user.is_active}`)
    })

    // Step 3: Check user-organization links
    console.log('\n🔗 Step 3: User-Organization Links')
    const { data: allUserOrgs, error: userOrgsError } = await supabaseAdmin
      .from('user_organizations')
      .select(`
        *,
        core_users (
          user_name,
          email,
          auth_user_id
        ),
        core_organizations (
          org_name,
          industry,
          is_active
        )
      `)
      .order('created_at', { ascending: false })

    if (userOrgsError) {
      console.error('❌ Error fetching user-organization links:', userOrgsError)
      return
    }

    console.log(`✅ Found ${allUserOrgs?.length || 0} user-organization links:`)
    allUserOrgs?.forEach((link, index) => {
      console.log(`   ${index + 1}. Link ID: ${link.id}`)
      console.log(`      - User: ${link.core_users?.user_name} (${link.core_users?.email})`)
      console.log(`      - Auth User ID: ${link.core_users?.auth_user_id}`)
      console.log(`      - Organization: ${link.core_organizations?.org_name}`)
      console.log(`      - Role: ${link.role}`)
      console.log(`      - Active: ${link.is_active}`)
    })

    // Step 4: Check auth users
    console.log('\n🔐 Step 4: Auth Users (using admin)')
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }

    console.log(`✅ Found ${authUsers.users?.length || 0} auth users:`)
    authUsers.users?.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`)
      console.log(`      - Created: ${user.created_at}`)
      console.log(`      - Last Sign In: ${user.last_sign_in_at}`)
    })

    // Step 5: Check for "Hera" restaurant specifically
    console.log('\n🏪 Step 5: Looking for "Hera" restaurant')
    const heraRestaurant = allOrgs?.find(org => 
      org.org_name?.toLowerCase().includes('hera')
    )

    if (heraRestaurant) {
      console.log('✅ Found Hera restaurant:')
      console.log(`   - Name: ${heraRestaurant.org_name}`)
      console.log(`   - ID: ${heraRestaurant.id}`)
      console.log(`   - Client ID: ${heraRestaurant.client_id}`)
      console.log(`   - Active: ${heraRestaurant.is_active}`)

      // Check if there's a user linked to this restaurant
      const heraUserLink = allUserOrgs?.find(link => 
        link.organization_id === heraRestaurant.id
      )

      if (heraUserLink) {
        console.log('✅ Found user link for Hera:')
        console.log(`   - User: ${heraUserLink.core_users?.user_name}`)
        console.log(`   - Email: ${heraUserLink.core_users?.email}`)
        console.log(`   - Auth ID: ${heraUserLink.core_users?.auth_user_id}`)
      } else {
        console.log('❌ No user link found for Hera restaurant!')
        console.log('   This is likely the cause of "No Restaurant Found" error')
      }
    } else {
      console.log('❌ No "Hera" restaurant found!')
    }

    // Step 6: Test the hook's query logic
    console.log('\n🔧 Step 6: Testing hook query logic')
    
    // Get the first auth user (assuming this is the current user)
    if (authUsers.users && authUsers.users.length > 0) {
      const testAuthUser = authUsers.users[0]
      console.log(`🧪 Testing with auth user: ${testAuthUser.email}`)

      // Replicate the hook's query
      const { data: userOrganizations, error: orgError } = await supabaseAdmin
        .from('core_users')
        .select(`
          id,
          user_organizations (
            organization_id,
            role,
            is_active,
            created_at,
            core_organizations (
              id,
              org_name,
              org_code,
              industry,
              client_id,
              country,
              currency,
              is_active,
              created_at,
              updated_at
            )
          )
        `)
        .eq('auth_user_id', testAuthUser.id)
        .single()

      if (orgError) {
        console.error('❌ Hook query failed:', orgError)
      } else if (!userOrganizations?.user_organizations) {
        console.log('❌ No organizations found for user')
      } else {
        console.log('✅ Hook query successful:')
        console.log(`   - Found ${userOrganizations.user_organizations.length} organization(s)`)
        
        const restaurantLinks = userOrganizations.user_organizations.filter((link) => 
          link.core_organizations?.industry === 'restaurant' && link.is_active
        )
        
        console.log(`   - Restaurant links: ${restaurantLinks.length}`)
        restaurantLinks.forEach((link, index) => {
          console.log(`      ${index + 1}. ${link.core_organizations?.org_name}`)
        })
      }
    }

    console.log('\n🎯 DIAGNOSIS COMPLETE')
    console.log('=' .repeat(50))

  } catch (error) {
    console.error('❌ Diagnostic script failed:', error)
  }
}

// Auto-run if called directly
if (require.main === module) {
  diagnoseRestaurantData()
}

module.exports = { diagnoseRestaurantData }