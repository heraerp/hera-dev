/**
 * Debug Restaurant Data
 * This script checks what restaurant data exists for a user
 */

import { createClient } from '@/lib/supabase/client';
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Create Supabase client with service role for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing')

async function debugRestaurantData() {
  try {
    console.log('🔍 Debugging Restaurant Data...')
    
    // Get all auth users
    console.log('\n📋 All Auth Users:')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
      console.error('❌ Auth error:', authError)
      return
    }
    
    authUsers.users.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`)
    })
    
    // Get all core users
    console.log('\n📋 All Core Users:')
    const { data: coreUsers, error: coreUsersError } = await supabase
      .from('core_users')
      .select('*')
    
    if (coreUsersError) {
      console.error('❌ Core users error:', coreUsersError)
    } else {
      coreUsers?.forEach(user => {
        console.log(`  - ${user.email} (core: ${user.id}, auth: ${user.auth_user_id})`)
      })
    }
    
    // Get all clients
    console.log('\n📋 All Clients:')
    const { data: clients, error: clientsError } = await supabase
      .from('core_clients')
      .select('*')
    
    if (clientsError) {
      console.error('❌ Clients error:', clientsError)
    } else {
      clients?.forEach(client => {
        console.log(`  - ${client.client_name} (${client.id})`)
      })
    }
    
    // Get all organizations
    console.log('\n📋 All Organizations:')
    const { data: organizations, error: orgsError } = await supabase
      .from('core_organizations')
      .select('*')
    
    if (orgsError) {
      console.error('❌ Organizations error:', orgsError)
    } else {
      organizations?.forEach(org => {
        console.log(`  - ${org.org_name} (${org.id}) - Client: ${org.client_id}`)
      })
    }
    
    // Get all user-organization links
    console.log('\n📋 All User-Organization Links:')
    const { data: userOrgs, error: userOrgsError } = await supabase
      .from('user_organizations')
      .select(`
        *,
        core_users(email, full_name),
        core_organizations(org_name, industry)
      `)
    
    if (userOrgsError) {
      console.error('❌ User organizations error:', userOrgsError)
    } else {
      userOrgs?.forEach(link => {
        console.log(`  - User: ${link.core_users?.email} → Org: ${link.core_organizations?.org_name} (${link.role})`)
      })
    }
    
    // Check for the most recent user and their data
    if (authUsers.users.length > 0) {
      const mostRecentUser = authUsers.users.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
      
      console.log(`\n🔍 Detailed check for most recent user: ${mostRecentUser.email}`)
      
      // Get their core user record
      const { data: coreUser, error: coreUserError } = await supabase
        .from('core_users')
        .select('*')
        .eq('auth_user_id', mostRecentUser.id)
        .single()
      
      if (coreUserError) {
        console.log('❌ No core user found:', coreUserError.message)
      } else {
        console.log(`✅ Core user found: ${coreUser.email} (${coreUser.id})`)
        
        // Get their organization links
        const { data: userOrgLinks, error: linkError } = await supabase
          .from('user_organizations')
          .select(`
            *,
            core_organizations (
              id,
              org_name,
              org_code,
              industry,
              client_id,
              is_active
            )
          `)
          .eq('user_id', coreUser.id)
        
        if (linkError) {
          console.log('❌ No organization links found:', linkError.message)
        } else if (!userOrgLinks || userOrgLinks.length === 0) {
          console.log('❌ No organization links found for this user')
        } else {
          console.log(`✅ Found ${userOrgLinks.length} organization link(s):`)
          userOrgLinks.forEach(link => {
            console.log(`  - Role: ${link.role}, Org: ${link.core_organizations?.org_name} (${link.core_organizations?.industry})`)
          })
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Debug script error:', error)
  }
}

// Run the debug script
debugRestaurantData()