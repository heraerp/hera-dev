/**
 * Check what auth users exist
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAuthUsers() {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error listing auth users:', error);
      return;
    }

    console.log('Available auth users:');
    users.users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email || 'No email'}`);
    });

    if (users.users.length > 0) {
      console.log('\nFirst auth user ID:', users.users[0].id);
      return users.users[0].id;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAuthUsers();