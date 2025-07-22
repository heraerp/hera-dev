/**
 * Check user schema
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserSchema() {
  try {
    // Check existing users
    const { data: users, error } = await supabase
      .from('core_users')
      .select('*')
      .limit(2);

    if (error) {
      console.error('Error accessing core_users:', error);
      return;
    }

    console.log('Sample users:', JSON.stringify(users, null, 2));
    
    if (users.length > 0) {
      console.log('\nUser fields:', Object.keys(users[0]));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserSchema();