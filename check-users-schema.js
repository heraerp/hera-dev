import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { createClient } from '@/lib/supabase/client';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY}`
      }
    }
  }
);

console.log('🔍 Checking core_users table schema...');

async function checkUsersSchema() {
  try {
    const { data, error } = await supabase
      .from('core_users')
      .select('*')
      .limit(1);
      
    if (!error) {
      console.log('✅ core_users table accessible');
      if (data && data.length > 0) {
        console.log('Available fields:', Object.keys(data[0]));
      } else {
        console.log('No data in table, trying insert test...');
        
        const testId = crypto.randomUUID();
        const { error: insertError } = await supabase
          .from('core_users')
          .insert({
            id: testId,
            auth_user_id: 'test-auth-id'
          });
          
        if (insertError) {
          console.log('Insert error (reveals required fields):', insertError.message);
        }
      }
    } else {
      console.log('❌ core_users access failed:', error.message);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

checkUsersSchema().then(() => {
  console.log('\n📊 Users schema check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});