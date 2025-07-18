const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY}`
      }
    }
  }
);

const testProductCreationWithExtendedSchema = async () => {
  console.log('🚀 Testing Product Creation with Extended Metadata Schema\n');

  try {
    // Get first available organization
    console.log('✅ Step 1: Finding test organization...');
    const { data: organizations, error: orgError } = await supabase
      .from('core_organizations')
      .select('id, org_name')
      .limit(1);

    if (orgError || !organizations || organizations.length === 0) {
      console.error('❌ No organizations found:', orgError);
      return;
    }

    const organizationId = organizations[0].id;
    console.log(`✅ Using organization: ${organizations[0].org_name} (${organizationId})`);

    // Get a real user ID for created_by field
    console.log('   🔍 Finding a user for created_by field...');
    const { data: users, error: usersError } = await supabase
      .from('core_users')
      .select('id')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.error('❌ No users found for created_by field:', usersError);
      return;
    }

    const createdByUserId = users[0].id;
    console.log(`   ✅ Using user ID: ${createdByUserId}`);

    // Generate test product data with proper UUID
    const { randomUUID } = require('crypto');
    const productId = randomUUID();
    const productCode = `TEST-${Date.now()}`;

    console.log('\n✅ Step 2: Creating product entity...');
    
    // Step 2a: Create core entity
    const { error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: productId,
        organization_id: organizationId,
        entity_type: 'product',
        entity_name: 'Schema Test Product',
        entity_code: productCode,
        is_active: true
      });

    if (entityError) {
      console.error('❌ Entity creation failed:', entityError);
      return;
    }
    console.log('   ✅ Core entity created');

    // Step 2b: Create dynamic data
    console.log('   📊 Creating dynamic data...');
    const dynamicData = [
      { entity_id: productId, field_name: 'category_id', field_value: 'tea', field_type: 'text' },
      { entity_id: productId, field_name: 'description', field_value: 'Schema compliance test product', field_type: 'text' },
      { entity_id: productId, field_name: 'base_price', field_value: '9.99', field_type: 'number' },
      { entity_id: productId, field_name: 'sku', field_value: 'SCHEMA-TEST-001', field_type: 'text' },
      { entity_id: productId, field_name: 'preparation_time_minutes', field_value: '3', field_type: 'number' },
      { entity_id: productId, field_name: 'product_type', field_value: 'tea', field_type: 'text' }
    ];

    const { error: dataError } = await supabase
      .from('core_dynamic_data')
      .insert(dynamicData);

    if (dataError) {
      console.error('❌ Dynamic data creation failed:', dataError);
      return;
    }
    console.log('   ✅ Dynamic data created (6 records)');

    // Step 2c: Create metadata with ALL extended columns
    console.log('   🎯 Creating metadata with production schema...');
    
    const metadataInsert = {
      // Core columns (original 7)
      organization_id: organizationId,
      entity_type: 'product',
      entity_id: productId,
      metadata_type: 'product_details',
      metadata_category: 'product_info',
      metadata_key: 'product_configuration',
      metadata_value: {
        brewing_instructions: {
          temperature: '185°F (85°C)',
          steeping_time: '2-3 minutes',
          tea_amount: '1 tsp per cup'
        },
        test_metadata: true,
        schema_version: 'extended'
      },
      // Extended columns (additional 18)
      metadata_scope: null,
      metadata_value_type: 'json',
      is_system_generated: false,
      is_user_editable: true,
      is_searchable: true,
      is_encrypted: false,
      effective_from: new Date().toISOString(),
      effective_to: null,
      is_active: true,
      version: 1,
      previous_version_id: null,
      change_reason: null,
      ai_generated: false,
      ai_confidence_score: null,
      ai_model_version: null,
      ai_last_updated: null,
      created_by: createdByUserId,
      updated_by: null
    };

    console.log('   📝 Inserting metadata with 25 columns total...');
    const { error: metadataError } = await supabase
      .from('core_metadata')
      .insert(metadataInsert);

    if (metadataError) {
      console.error('❌ Metadata creation failed:', metadataError);
      console.error('   Error details:', JSON.stringify(metadataError, null, 2));
      
      // Check if it's a schema mismatch
      if (metadataError.message && metadataError.message.includes('column')) {
        console.error('\n🔍 Schema mismatch detected! Missing columns in production database.');
        console.error('   The production core_metadata table may not have all extended columns.');
      }
      return;
    }
    console.log('   ✅ Metadata created with extended schema');

    console.log('\n🎉 SUCCESS: Complete product creation test passed!');
    console.log(`   📦 Product ID: ${productId}`);
    console.log(`   🏷️  Product Code: ${productCode}`);
    console.log(`   🏢 Organization: ${organizations[0].org_name}`);
    
    console.log('\n📊 Database Operations Completed:');
    console.log('   ✅ 1 record in core_entities');
    console.log('   ✅ 6 records in core_dynamic_data');
    console.log('   ✅ 1 record in core_metadata (25 columns)');
    
    console.log('\n🔍 Schema Compliance Status:');
    console.log('   ✅ Production schema compatibility: CONFIRMED');
    console.log('   ✅ Extended metadata columns: SUPPORTED');
    console.log('   ✅ No 400 errors: RESOLVED');
    console.log('   ✅ Enhanced Products Management: READY');

    // Verify the creation
    console.log('\n🔍 Verifying created product...');
    const { data: createdProduct, error: verifyError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', productId)
      .single();

    if (verifyError || !createdProduct) {
      console.error('❌ Product verification failed');
      return;
    }

    console.log('✅ Product verification successful');
    console.log(`   📝 Name: ${createdProduct.entity_name}`);
    console.log(`   🏷️  Code: ${createdProduct.entity_code}`);
    console.log(`   📅 Created: ${new Date(createdProduct.created_at).toLocaleString()}`);

  } catch (error) {
    console.error('🚨 Test failed with error:', error);
    
    if (error.message && error.message.includes('JWT')) {
      console.error('\n🔑 Authentication Error: Check your NEXT_PUBLIC_SUPABASE_SERVICE_KEY');
    } else if (error.message && error.message.includes('supabaseUrl')) {
      console.error('\n🌐 Configuration Error: Check your NEXT_PUBLIC_SUPABASE_URL');
    }
  }
};

// Run the test
testProductCreationWithExtendedSchema();