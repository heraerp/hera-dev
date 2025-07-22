/**
 * Simple test to create a user with Mario's organization
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUserCreation() {
  const MARIO_ORG_ID = '123e4567-e89b-12d3-a456-426614174000';
  const testUserId = crypto.randomUUID();
  const testEmail = `test-${Date.now()}@demo.com`;
  
  console.log('Testing user creation with Mario\'s org...');
  console.log('Organization ID:', MARIO_ORG_ID);
  console.log('Test User ID:', testUserId);
  console.log('Test Email:', testEmail);

  try {
    // Try creating a user in Mario's organization
    const { data, error } = await supabase
      .from('core_users')
      .insert({
        id: testUserId,
        auth_user_id: crypto.randomUUID(),
        email: testEmail,
        full_name: 'Test User',
        user_role: 'owner',
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ User creation error:', error);
      return;
    }

    console.log('✅ User created:', data);

    // Now try to link to organization
    const { data: linkData, error: linkError } = await supabase
      .from('user_organizations')
      .insert({
        user_id: testUserId,
        organization_id: MARIO_ORG_ID,
        role: 'owner',
        is_active: true
      })
      .select()
      .single();

    if (linkError) {
      console.error('❌ Link creation error:', linkError);
    } else {
      console.log('✅ User linked to organization:', linkData);
    }

    // Clean up
    console.log('\n🧹 Cleaning up...');
    await supabase.from('user_organizations').delete().eq('user_id', testUserId);
    await supabase.from('core_users').delete().eq('id', testUserId);
    console.log('✅ Cleanup complete');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testUserCreation();