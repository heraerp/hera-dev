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

console.log('🔍 Checking core_organizations table schema...');

// Try different field combinations to identify the actual schema
const testCombinations = [
  // Standard naming convention
  { name: 'name', org_code: 'org_code', industry: 'industry' },
  // Alternative naming convention
  { organization_name: 'organization_name', code: 'code', type: 'type' },
  // Mixed naming
  { name: 'name', code: 'code', type: 'type' },
  { organization_name: 'organization_name', org_code: 'org_code', industry: 'industry' }
];

async function checkSchema() {
  for (let i = 0; i < testCombinations.length; i++) {
    const combo = testCombinations[i];
    const fields = Object.keys(combo).join(', ');
    
    console.log(`\nTesting combination ${i + 1}: ${fields}`);
    
    try {
      const { data, error } = await supabase
        .from('core_organizations')
        .select(fields)
        .limit(1);
        
      if (!error) {
        console.log(`✅ SUCCESS: Fields ${fields} exist`);
        console.log('Data sample:', data);
        return combo;
      } else {
        console.log(`❌ Failed: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }
  
  // If none work, try a basic select to see what we get
  console.log('\n🔍 Trying basic select to identify available fields...');
  try {
    const { data, error } = await supabase
      .from('core_organizations')
      .select('*')
      .limit(1);
      
    if (!error) {
      console.log('✅ Basic select succeeded');
      if (data && data.length > 0) {
        console.log('Available fields:', Object.keys(data[0]));
        return Object.keys(data[0]);
      } else {
        console.log('No data in table, but table exists');
        
        // Try inserting a test record to see required fields
        console.log('\n🧪 Testing insert to identify required fields...');
        const testId = crypto.randomUUID();
        
        const { error: insertError } = await supabase
          .from('core_organizations')
          .insert({
            id: testId
          });
          
        if (insertError) {
          console.log('Insert error (reveals required fields):', insertError.message);
        }
      }
    } else {
      console.log('❌ Basic select failed:', error.message);
    }
  } catch (err) {
    console.log('❌ Basic select error:', err.message);
  }
  
  return null;
}

checkSchema().then((result) => {
  console.log('\n📊 Schema check completed');
  if (result) {
    console.log('Working field combination:', result);
  } else {
    console.log('Could not determine working field combination');
  }
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});