/**
 * Check existing clients
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkClients() {
  try {
    // Check if core_clients table exists
    const { data: clients, error } = await supabase
      .from('core_clients')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error accessing core_clients:', error);
      return;
    }

    console.log('Available clients:', clients);
    
    // Also check existing organizations to see what client_id they use
    const { data: orgs } = await supabase
      .from('core_organizations')
      .select('id, org_name, client_id')
      .limit(3);

    console.log('\nExisting organizations:', orgs);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkClients();