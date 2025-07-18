/**
 * Find a valid user ID for created_by field
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';

async function findUserId() {
  console.log('🔍 Finding valid user ID...\n');
  
  try {
    // Check core_users table
    const { data: users, error: usersError } = await supabase
      .from('core_users')
      .select('id, email, full_name')
      .eq('is_active', true)
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }
    
    console.log(`✅ Found ${users?.length || 0} users`);
    
    if (users && users.length > 0) {
      console.log('\n👤 Available users:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.full_name} (${user.email}) - ID: ${user.id}`);
      });
      
      // Use the first user ID
      const userId = users[0].id;
      console.log(`\n🎯 Using user ID: ${userId}`);
      return userId;
    } else {
      console.log('❌ No users found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findUserId().then(userId => {
  if (userId) {
    console.log(`\n✅ Use this user ID in your scripts: ${userId}`);
  }
});