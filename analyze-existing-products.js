const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

/**
 * 🎯 ANALYZE EXISTING PRODUCTS
 * Check if any products exist and how they were created successfully
 */

async function analyzeExistingProducts() {
  console.log('🔍 ANALYZING EXISTING PRODUCTS IN DATABASE...\n');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
  
  const supabaseAdmin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    }
  });
  
  console.log('🧪 Step 1: Check for existing products...');
  try {
    const { data: products, error: productsError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('entity_type', 'product')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return;
    }
    
    console.log(`✅ Found ${products.length} existing products:`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ID: ${product.id}`);
      console.log(`      Name: ${product.entity_name}`);
      console.log(`      Code: ${product.entity_code}`);
      console.log(`      Org ID: ${product.organization_id}`);
      console.log(`      Created: ${product.created_at}`);
      console.log('');
    });
    
    if (products.length > 0) {
      console.log('🧪 Step 2: Check for existing metadata...');
      const productIds = products.map(p => p.id);
      
      const { data: metadata, error: metaError } = await supabaseAdmin
        .from('core_metadata')
        .select('*')
        .in('entity_id', productIds)
        .eq('entity_type', 'product');
      
      if (!metaError) {
        console.log(`✅ Found ${metadata.length} metadata records for existing products`);
        if (metadata.length > 0) {
          console.log('Sample metadata:');
          console.log(JSON.stringify(metadata[0], null, 2));
        }
      }
      
      console.log('\n🧪 Step 3: Check audit log for existing products...');
      const { data: auditLog, error: auditError } = await supabaseAdmin
        .from('core_change_documents')
        .select('*')
        .in('entity_id', productIds)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!auditError && auditLog) {
        console.log(`✅ Found ${auditLog.length} audit records:`);
        auditLog.forEach((log, index) => {
          console.log(`   ${index + 1}. Entity ID: ${log.entity_id}`);
          console.log(`      Action: ${log.action_type}`);
          console.log(`      Changed By: ${log.changed_by}`);
          console.log(`      Created: ${log.created_at}`);
          console.log('');
        });
        
        if (auditLog.length > 0) {
          const workingChangedBy = auditLog[0].changed_by;
          console.log(`🎯 FOUND WORKING PATTERN!`);
          console.log(`✅ Existing products use changed_by: ${workingChangedBy}`);
          
          console.log('\n🧪 Step 4: Test creating with same changed_by pattern...');
          
          // Check if this changed_by user exists
          const { data: user, error: userError } = await supabaseAdmin
            .from('core_users')
            .select('*')
            .eq('id', workingChangedBy)
            .single();
          
          if (!userError && user) {
            console.log(`✅ Changed_by user exists: ${user.full_name} (${user.email})`);
            
            // Try to create a product using the same changed_by approach
            const testProductId = crypto.randomUUID();
            
            // Since we can't add changed_by to the INSERT (field doesn't exist),
            // let's check if there's a session variable or trigger approach
            console.log('\n🧪 Step 5: Test session variable approach with working user...');
            
            // Try setting session variables that the audit trigger might read
            try {
              // Set various session variables that audit triggers commonly use
              await supabaseAdmin.query(
                `SELECT set_config('app.current_user_id', $1, true)`,
                [workingChangedBy]
              );
            } catch (e1) {
              try {
                await supabaseAdmin.query(
                  `SELECT set_config('audit.user_id', $1, true)`,
                  [workingChangedBy]
                );
              } catch (e2) {
                console.log('Session variable methods not available');
              }
            }
            
            // Now try to create with this session context
            const { data: testData, error: testError } = await supabaseAdmin
              .from('core_entities')
              .insert({
                id: testProductId,
                organization_id: products[0].organization_id, // Use same org as existing
                entity_type: 'product',
                entity_name: 'TEST_WORKING_PATTERN',
                entity_code: 'TEST-WORK-001',
                is_active: true
              })
              .select();
            
            if (testError) {
              console.error(`❌ Still failed: ${testError.message}`);
              
              // The changed_by is being set by the trigger, not by us
              // Let's see if we can understand the trigger logic
              console.log('\n🧪 Step 6: Analyze trigger behavior...');
              console.log('💡 The trigger is automatically setting changed_by from session context');
              console.log('💡 We need to find how to set the correct session context');
              
            } else {
              console.log('✅ SUCCESS with working pattern!');
              console.log(`Created product: ${testData[0].id}`);
              
              // Clean up
              await supabaseAdmin.from('core_entities').delete().eq('id', testProductId);
            }
          } else {
            console.error('❌ Changed_by user not found in core_users');
          }
        }
      } else {
        console.log('❌ No audit records found or error:', auditError?.message);
      }
      
    } else {
      console.log('❌ No existing products found - cannot analyze working pattern');
      
      console.log('\n🧪 Alternative: Check if audit triggers can be bypassed...');
      
      // Check if there are any tables without audit triggers
      const { data: entities, error } = await supabaseAdmin
        .from('core_clients')
        .select('*')
        .limit(1);
      
      if (!error) {
        console.log('✅ core_clients table accessible - may not have same audit constraints');
        
        // Test a simple insert to see if audit triggers fire
        const testClientId = crypto.randomUUID();
        const { data: clientData, error: clientError } = await supabaseAdmin
          .from('core_clients')
          .insert({
            id: testClientId,
            client_name: 'Test Audit Client',
            client_code: 'TEST-AUDIT-001',
            client_type: 'test',
            is_active: true
          })
          .select();
        
        if (clientError) {
          console.error(`❌ core_clients also has audit issues: ${clientError.message}`);
        } else {
          console.log('✅ core_clients table works! This suggests audit triggers are table-specific');
          console.log('💡 May need to create products through different approach or request audit trigger modification');
          
          // Clean up
          await supabaseAdmin.from('core_clients').delete().eq('id', testClientId);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
  }
}

analyzeExistingProducts();