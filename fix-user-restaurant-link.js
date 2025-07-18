/**
 * Fix User Restaurant Link
 * This script manually links a user to their restaurant organization
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

async function fixUserRestaurantLink() {
  try {
    console.log('🔧 Fixing User Restaurant Link...')
    
    // Get the most recent user (likely the one who just set up)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
      console.error('❌ Auth error:', authError)
      return
    }
    
    const mostRecentUser = authUsers.users.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
    
    console.log(`🔍 Working with user: ${mostRecentUser.email}`)
    
    // Get their core user record
    const { data: coreUser, error: coreUserError } = await supabase
      .from('core_users')
      .select('*')
      .eq('auth_user_id', mostRecentUser.id)
      .single()
    
    if (coreUserError) {
      console.error('❌ No core user found:', coreUserError.message)
      return
    }
    
    console.log(`✅ Found core user: ${coreUser.email} (${coreUser.id})`)
    
    // Check if they already have organization links
    const { data: existingLinks, error: linkError } = await supabase
      .from('user_organizations')
      .select('*')
      .eq('user_id', coreUser.id)
    
    if (linkError) {
      console.error('❌ Error checking existing links:', linkError.message)
      return
    }
    
    if (existingLinks && existingLinks.length > 0) {
      console.log('✅ User already has organization links:', existingLinks.length)
      return
    }
    
    // Find the most recent restaurant organization (likely theirs)
    const { data: organizations, error: orgsError } = await supabase
      .from('core_organizations')
      .select('*')
      .eq('industry', 'restaurant')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (orgsError) {
      console.error('❌ Error fetching organizations:', orgsError.message)
      return
    }
    
    if (!organizations || organizations.length === 0) {
      console.error('❌ No restaurant organizations found')
      return
    }
    
    console.log('📋 Available restaurant organizations:')
    organizations.forEach((org, index) => {
      console.log(`  ${index + 1}. ${org.org_name} (Created: ${org.created_at})`)
    })
    
    // Use the most recent restaurant organization
    const targetOrganization = organizations[0]
    console.log(`🎯 Linking user to: ${targetOrganization.org_name}`)
    
    // Create the user-organization link
    const linkId = generateUUID()
    const { error: insertError } = await supabase
      .from('user_organizations')
      .insert({
        id: linkId,
        user_id: coreUser.id,
        organization_id: targetOrganization.id,
        role: 'owner',
        is_active: true,
        created_at: new Date().toISOString()
      })
    
    if (insertError) {
      console.error('❌ Error creating user-organization link:', insertError.message)
      return
    }
    
    console.log('✅ Successfully linked user to restaurant!')
    console.log(`   User: ${coreUser.email}`)
    console.log(`   Restaurant: ${targetOrganization.org_name}`)
    console.log(`   Role: owner`)
    
    // Verify the link was created
    const { data: verifyLink, error: verifyError } = await supabase
      .from('user_organizations')
      .select(`
        *,
        core_users(email),
        core_organizations(org_name, industry)
      `)
      .eq('id', linkId)
      .single()
    
    if (verifyError) {
      console.error('❌ Error verifying link:', verifyError.message)
    } else {
      console.log('🎉 Link verified successfully!')
      console.log(`   Link ID: ${verifyLink.id}`)
      console.log(`   User: ${verifyLink.core_users?.email}`)
      console.log(`   Organization: ${verifyLink.core_organizations?.org_name}`)
    }
    
  } catch (error) {
    console.error('❌ Fix script error:', error)
  }
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Run the fix script
fixUserRestaurantLink()