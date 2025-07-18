// Debug script to check auth user vs core_users table
// Run this in your browser console on the app

const checkAuthDebug = async () => {
  // Get current auth user
  const { data: { user } } = await window.supabase.auth.getUser();
  console.log('🔐 Auth User:', user);
  
  if (user) {
    // Check if user exists in core_users
    const { data: profile, error } = await window.supabase
      .from('core_users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    console.log('👤 Core Users Profile:', profile);
    console.log('❌ Profile Error:', error);
    
    // Also check by email
    const { data: profileByEmail } = await window.supabase
      .from('core_users')
      .select('*')
      .eq('email', user.email);
    
    console.log('📧 Profile by Email:', profileByEmail);
    
    // Check all users in core_users
    const { data: allUsers } = await window.supabase
      .from('core_users')
      .select('id, email, role');
    
    console.log('👥 All Core Users:', allUsers);
  }
};

// Make available globally
window.checkAuthDebug = checkAuthDebug;
console.log('🚀 Debug function loaded. Run: checkAuthDebug()');