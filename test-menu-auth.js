/**
 * Test Authentication Flow for Menu Management
 * This script helps debug the authentication flow
 */

console.log('🔐 Menu Management Authentication Test');
console.log('=====================================');

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  console.log('✅ Running in browser environment');
  
  // Check localStorage for auth tokens
  const authTokens = localStorage.getItem('sb-' + (process.env.NEXT_PUBLIC_SUPABASE_URL?.split('://')[1]?.split('.')[0] || 'default') + '-auth-token');
  console.log('🔑 Auth tokens in localStorage:', authTokens ? 'Present' : 'Missing');
  
  // Check restaurant preference
  const restaurantPreference = localStorage.getItem('selectedRestaurant');
  console.log('🏠 Restaurant preference:', restaurantPreference ? 'Present' : 'Missing');
  
  // Check current URL
  console.log('🌐 Current URL:', window.location.href);
  
  // Check if user is on login page
  if (window.location.pathname === '/restaurant/signin') {
    console.log('📍 User is on signin page');
  } else if (window.location.pathname === '/restaurant/menu-management') {
    console.log('📍 User is on menu management page');
  } else {
    console.log('📍 User is on:', window.location.pathname);
  }
  
} else {
  console.log('❌ Not in browser environment');
}

// Test function to check authentication
async function testAuth() {
  if (typeof window === 'undefined') return;
  
  try {
    // Import Supabase client
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    
    console.log('🔍 Testing authentication...');
    
    // Check current user
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Auth error:', error);
      return;
    }
    
    if (user) {
      console.log('✅ User authenticated:', user.email);
      console.log('🆔 User ID:', user.id);
      
      // Check core_users
      const { data: coreUser, error: coreError } = await supabase
        .from('core_users')
        .select('id, full_name, user_role')
        .eq('auth_user_id', user.id)
        .single();
      
      if (coreError) {
        console.error('❌ Core user error:', coreError);
        return;
      }
      
      if (coreUser) {
        console.log('✅ Core user found:', coreUser.full_name);
        console.log('👤 User role:', coreUser.user_role);
      }
      
    } else {
      console.log('❌ No user authenticated');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testAuth();

export default {};