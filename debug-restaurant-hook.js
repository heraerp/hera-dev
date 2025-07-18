/**
 * HERA Universal - Restaurant Hook Diagnostic
 * Traces exactly why useRestaurantManagement is returning 0 restaurants
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import { createClient } from '@/lib/supabase/client';

// Read environment variables from .env.local
const envPath = '.env.local'
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8')
  const envLines = envFile.split('\n')
  envLines.forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, value] = line.split('=')
      process.env[key] = value
    }
  })
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function diagnoseRestaurantHook() {
  console.log('🔍 HERA Universal - Restaurant Hook Diagnostic')
  console.log('=' .repeat(60))
  
  try {
    // Step 1: Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Auth Error:', authError?.message || 'No user found')
      return
    }
    
    console.log('✅ Step 1 - Auth User Found:')
    console.log(`   Email: ${user.email}`)
    console.log(`   User ID: ${user.id}`)
    console.log('')
    
    // Step 2: Find core_users record
    const { data: coreUser, error: coreUserError } = await supabase
      .from('core_users')
      .select('id, auth_user_id, first_name, last_name, email')
      .eq('auth_user_id', user.id)
      .single()
    
    if (coreUserError) {
      console.error('❌ Step 2 - Core User Error:', coreUserError.message)
      
      // Try to find any core_users with similar email
      const { data: similarUsers } = await supabase
        .from('core_users')
        .select('id, auth_user_id, email')
        .ilike('email', `%${user.email}%`)
      
      console.log('🔍 Similar core_users found:', similarUsers?.length || 0)
      similarUsers?.forEach((u, i) => {
        console.log(`   ${i + 1}. ID: ${u.id}, Auth: ${u.auth_user_id}, Email: ${u.email}`)
      })
      return
    }
    
    console.log('✅ Step 2 - Core User Found:')
    console.log(`   Core User ID: ${coreUser.id}`)
    console.log(`   Name: ${coreUser.first_name} ${coreUser.last_name}`)
    console.log(`   Email: ${coreUser.email}`)
    console.log('')
    
    // Step 3: Check user_organizations links
    const { data: userOrgLinks, error: userOrgError } = await supabase
      .from('user_organizations')
      .select('id, user_id, organization_id, role, is_active, created_at')
      .eq('user_id', coreUser.id)
    
    if (userOrgError) {
      console.error('❌ Step 3 - User Organizations Error:', userOrgError.message)
      return
    }
    
    console.log('✅ Step 3 - User Organization Links:')
    console.log(`   Found: ${userOrgLinks?.length || 0} link(s)`)
    
    if (!userOrgLinks || userOrgLinks.length === 0) {
      console.log('⚠️ NO USER-ORGANIZATION LINKS FOUND!')
      console.log('   This is the root cause - user is not linked to any organizations')
      
      // Check if organizations exist but aren't linked
      const { data: allOrgs } = await supabase
        .from('core_organizations')
        .select('id, org_name, industry')
        .limit(10)
      
      console.log(`🔍 Total organizations in system: ${allOrgs?.length || 0}`)
      allOrgs?.forEach((org, i) => {
        console.log(`   ${i + 1}. ${org.org_name} (${org.industry})`)
      })
      
      return
    }
    
    userOrgLinks.forEach((link, i) => {
      console.log(`   ${i + 1}. Org ID: ${link.organization_id}`)
      console.log(`      Role: ${link.role}`)
      console.log(`      Active: ${link.is_active}`)
      console.log(`      Created: ${link.created_at}`)
    })
    console.log('')
    
    // Step 4: Get organization details
    const organizationIds = userOrgLinks.map(link => link.organization_id)
    const { data: organizations, error: orgsError } = await supabase
      .from('core_organizations')
      .select('id, org_name, org_code, industry, client_id, country, currency, is_active, created_at')
      .in('id', organizationIds)
    
    if (orgsError) {
      console.error('❌ Step 4 - Organizations Error:', orgsError.message)
      return
    }
    
    console.log('✅ Step 4 - Organization Details:')
    console.log(`   Found: ${organizations?.length || 0} organization(s)`)
    
    if (!organizations || organizations.length === 0) {
      console.log('⚠️ NO ORGANIZATION RECORDS FOUND!')
      console.log('   The organization IDs in user_organizations don\'t match any records in core_organizations')
      
      // Check what organization IDs were requested
      console.log('🔍 Requested Organization IDs:')
      organizationIds.forEach((id, i) => {
        console.log(`   ${i + 1}. ${id}`)
      })
      
      return
    }
    
    organizations.forEach((org, i) => {
      console.log(`   ${i + 1}. ${org.org_name}`)
      console.log(`      ID: ${org.id}`)
      console.log(`      Industry: ${org.industry}`)
      console.log(`      Active: ${org.is_active}`)
      console.log(`      Client ID: ${org.client_id}`)
      console.log(`      Country: ${org.country}`)
    })
    console.log('')
    
    // Step 5: Manual join and filter restaurants
    const organizationMap = new Map()
    organizations.forEach(org => organizationMap.set(org.id, org))
    
    const combinedLinks = userOrgLinks.map(link => ({
      ...link,
      core_organizations: organizationMap.get(link.organization_id)
    }))
    
    console.log('✅ Step 5 - Combined Data:')
    combinedLinks.forEach((link, i) => {
      const org = link.core_organizations
      console.log(`   ${i + 1}. ${org?.org_name || 'NOT FOUND'}`)
      console.log(`      Industry: ${org?.industry || 'NOT FOUND'}`)
      console.log(`      Link Active: ${link.is_active}`)
      console.log(`      Org Active: ${org?.is_active || 'NOT FOUND'}`)
    })
    console.log('')
    
    // Step 6: Filter for restaurants
    const restaurantLinks = combinedLinks.filter(link => 
      link.core_organizations?.industry === 'restaurant' && 
      link.is_active && 
      link.core_organizations?.is_active
    )
    
    console.log('✅ Step 6 - Restaurant Filter Results:')
    console.log(`   Restaurant organizations found: ${restaurantLinks.length}`)
    
    if (restaurantLinks.length === 0) {
      console.log('⚠️ NO RESTAURANTS AFTER FILTERING!')
      console.log('   Possible causes:')
      console.log('   - Organizations have industry != "restaurant"')
      console.log('   - User organization links are inactive (is_active = false)')
      console.log('   - Organization records are inactive (is_active = false)')
    } else {
      restaurantLinks.forEach((link, i) => {
        const org = link.core_organizations
        console.log(`   ${i + 1}. ${org.org_name}`)
        console.log(`      Industry: ${org.industry}`)
        console.log(`      Role: ${link.role}`)
      })
    }
    
    console.log('')
    console.log('🎯 DIAGNOSIS COMPLETE')
    console.log('=' .repeat(60))
    
  } catch (error) {
    console.error('💥 Unexpected Error:', error)
  }
}

// Run the diagnostic
diagnoseRestaurantHook()