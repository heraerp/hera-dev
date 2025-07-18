/**
 * HERA Universal - Browser Session Diagnostic
 * 
 * Copy and paste this script into your browser console
 * when you're experiencing the "No Restaurant Found" issue.
 * 
 * INSTRUCTIONS:
 * 1. Go to the restaurant dashboard where you see "No Restaurant Found"
 * 2. Open Developer Tools (F12)
 * 3. Go to Console tab
 * 4. Paste this entire script and press Enter
 */

import { createClient } from '@/lib/supabase/client';
console.log('🔍 HERA Universal Browser Session Diagnostic');
console.log('=' .repeat(60));

// Check if we're on the right page
console.log('📍 Current URL:', window.location.href);

// Check for Supabase client in global scope or create one
let supabase;
try {
  // Try to access global supabase if available
  if (window.supabase) {
    supabase = window.supabase;
    console.log('✅ Using global Supabase client');
  } else {
    // Create a new client (you'll need to replace these with your actual values)
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js');
    supabase = createClient(
      'YOUR_SUPABASE_URL', // Replace with actual URL
      'YOUR_SUPABASE_ANON_KEY' // Replace with actual anon key
    );
    console.log('✅ Created new Supabase client');
  }
} catch (error) {
  console.error('❌ Failed to get Supabase client:', error);
  console.log('Please run this script from a page where Supabase is loaded, or update the URLs above');
}

async function diagnoseSession() {
  try {
    // Step 1: Check current auth session
    console.log('\n🔐 Step 1: Checking authentication session');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return;
    }
    
    if (!session) {
      console.log('❌ No active session found');
      console.log('   You are not logged in. Please log in first.');
      return;
    }
    
    console.log('✅ Active session found:');
    console.log(`   - User ID: ${session.user.id}`);
    console.log(`   - Email: ${session.user.email}`);
    console.log(`   - Session expires: ${new Date(session.expires_at * 1000)}`);
    
    const authUserId = session.user.id;
    
    // Step 2: Check localStorage for cached restaurant data
    console.log('\n💾 Step 2: Checking localStorage cache');
    const cachedRestaurant = localStorage.getItem(`preferred-restaurant-${authUserId}`);
    if (cachedRestaurant) {
      console.log(`✅ Cached restaurant preference: ${cachedRestaurant}`);
    } else {
      console.log('ℹ️ No cached restaurant preference');
    }
    
    // Step 3: Test the hook's query directly
    console.log('\n🧪 Step 3: Testing restaurant data query');
    const { data: userOrganizations, error: orgError } = await supabase
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
      .eq('auth_user_id', authUserId)
      .single();

    if (orgError) {
      console.error('❌ Query error:', orgError);
      console.log('   This suggests the core_users record might be missing');
      
      // Check if core_users record exists
      const { data: coreUser, error: coreUserError } = await supabase
        .from('core_users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();
        
      if (coreUserError) {
        console.error('❌ No core_users record found for your auth user');
        console.log('   ROOT CAUSE: Your user account is not properly linked to HERA system');
        console.log('   SOLUTION: Contact support to create the missing core_users link');
      } else {
        console.log('✅ Core user record exists:', coreUser.full_name);
        console.log('   The issue is with the organization query, not the user record');
      }
      return;
    }

    if (!userOrganizations?.user_organizations) {
      console.log('❌ No user_organizations found in the response');
      console.log('   This means the user has no organization links');
      return;
    }

    console.log(`✅ Query successful - found ${userOrganizations.user_organizations.length} organization(s)`);
    
    // Filter for restaurant organizations
    const restaurantLinks = userOrganizations.user_organizations.filter((link) => 
      link.core_organizations?.industry === 'restaurant' && link.is_active
    );

    if (restaurantLinks.length === 0) {
      console.log('❌ No restaurant links found');
      console.log('   ROOT CAUSE: You have organization links but none are restaurants');
      
      // Show what organizations they do have
      console.log('   Your current organizations:');
      userOrganizations.user_organizations.forEach((link, index) => {
        console.log(`      ${index + 1}. ${link.core_organizations?.org_name} (${link.core_organizations?.industry})`);
      });
    } else {
      console.log(`✅ Found ${restaurantLinks.length} restaurant organization(s):`);
      restaurantLinks.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.core_organizations?.org_name}`);
        console.log(`      - ID: ${link.core_organizations?.id}`);
        console.log(`      - Role: ${link.role}`);
        console.log(`      - Active: ${link.is_active}`);
        console.log(`      - Created: ${link.core_organizations?.created_at}`);
      });
      
      console.log('\n✅ Restaurant links are properly configured!');
      console.log('   The issue might be with the React hook or component state.');
      console.log('   Try refreshing the page or clearing your browser cache.');
    }
    
    // Step 4: Check React component state if available
    console.log('\n⚛️ Step 4: Checking React component state');
    if (window.React && window.React.version) {
      console.log(`✅ React version: ${window.React.version}`);
      
      // Try to find React dev tools info
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('✅ React DevTools detected - check Components tab for useRestaurantManagement hook state');
      }
    } else {
      console.log('ℹ️ React not detected in global scope');
    }
    
    console.log('\n🎯 DIAGNOSIS COMPLETE');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

// Run the diagnostic
diagnoseSession();