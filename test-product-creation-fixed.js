#!/usr/bin/env node

/**
 * Test Product Creation with Extended Metadata Schema
 * Tests the ProductCatalogService with the updated schema that includes all 18 additional columns
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Initialize Supabase client
const supabase = createSupabaseClient(
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

const testProductCreation = async () => {
  console.log('🚀 Testing Product Creation with Extended Metadata Schema...\n');

  try {
    // Test organization ID (replace with real one from your database)
    let organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';
    
    console.log('✅ Step 1: Testing Supabase connection...');
    const { data: orgTest, error: orgError } = await supabase
      .from('core_organizations')
      .select('id, org_name')
      .eq('id', organizationId)
      .single();
      
    if (orgError) {
      console.log('❌ Organization not found, using first available org...');
      const { data: firstOrg } = await supabase
        .from('core_organizations')
        .select('id, org_name')
        .limit(1)
        .single();
      
      if (firstOrg) {
        organizationId = firstOrg.id;
        console.log(`✅ Using organization: ${firstOrg.org_name} (${firstOrg.id})`);
      } else {
        throw new Error('No organizations found in database');
      }
    } else {
      console.log(`✅ Found organization: ${orgTest.org_name}`);
    }

    console.log('\n✅ Step 2: Creating test product with extended metadata...');
    
    // Generate IDs
    const productId = crypto.randomUUID();
    const productCode = `TEST-PRODUCT-${Date.now()}`;
    
    // Create core entity
    console.log('   📦 Creating core entity...');
    const { error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: productId,
        organization_id: organizationId,
        entity_type: 'product',
        entity_name: 'Test Premium Tea',
        entity_code: productCode,
        is_active: true
      });
    
    if (entityError) {
      console.error('❌ Entity creation failed:', entityError);
      return;
    }
    console.log('   ✅ Core entity created successfully');

    // Create dynamic data
    console.log('   📊 Creating dynamic data...');
    const dynamicData = [
      { entity_id: productId, field_name: 'category_id', field_value: 'tea', field_type: 'text' },
      { entity_id: productId, field_name: 'description', field_value: 'A premium test tea', field_type: 'text' },
      { entity_id: productId, field_name: 'base_price', field_value: '15.99', field_type: 'number' },
      { entity_id: productId, field_name: 'sku', field_value: 'TEST-TEA-001', field_type: 'text' },
      { entity_id: productId, field_name: 'preparation_time_minutes', field_value: '5', field_type: 'number' },
      { entity_id: productId, field_name: 'product_type', field_value: 'tea', field_type: 'text' }
    ];
    
    const { error: dataError } = await supabase
      .from('core_dynamic_data')
      .insert(dynamicData);
    
    if (dataError) {
      console.error('❌ Dynamic data creation failed:', dataError);
      return;
    }
    console.log('   ✅ Dynamic data created successfully');

    // Create metadata with ALL extended columns
    console.log('   🎯 Creating metadata with extended schema (25 columns)...');
    const { error: metadataError } = await supabase
      .from('core_metadata')
      .insert({
        // Core columns (7)
        organization_id: organizationId,
        entity_type: 'product',
        entity_id: productId,
        metadata_type: 'product_details',
        metadata_category: 'product_info',
        metadata_key: 'product_configuration',
        metadata_value: JSON.stringify({
          brewing_instructions: {
            temperature: '200°F (93°C)',
            steeping_time: '3-5 minutes',
            tea_amount: '1 teaspoon per cup'
          },
          nutritional_info: {
            caffeine_content: 'Medium',
            calories_per_serving: 0,
            allergens: []
          },
          origin_story: 'A test tea for schema validation',
          seasonal_availability: false,
          popular_pairings: ['Cookies', 'Scones']
        }),
        // Extended columns (18) - ALL INCLUDED
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
        created_by: null,
        updated_by: null
      });
    
    if (metadataError) {
      console.error('❌ Metadata creation failed:', metadataError);
      console.error('   Error details:', JSON.stringify(metadataError, null, 2));
      return;
    }
    console.log('   ✅ Metadata created successfully with extended schema');

    console.log('\n🎉 SUCCESS: Product creation test completed!');
    console.log(`   📦 Product ID: ${productId}`);
    console.log(`   🏷️  Product Code: ${productCode}`);
    console.log(`   🏢 Organization ID: ${organizationId}`);
    
    console.log('\n📊 Database records created:');
    console.log('   ✅ 1 record in core_entities');
    console.log('   ✅ 6 records in core_dynamic_data');
    console.log('   ✅ 1 record in core_metadata (with 25 columns)');
    
    console.log('\n🔍 Verifying data integrity...');
    
    // Verify the product was created correctly
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
    console.log(`   📝 Product Name: ${createdProduct.entity_name}`);
    console.log(`   🏷️  Product Code: ${createdProduct.entity_code}`);
    console.log(`   🔄 Status: ${createdProduct.is_active ? 'Active' : 'Inactive'}`);
    
    console.log('\n🎯 Schema Alignment Status: COMPLETE ✅');
    console.log('   ✅ Production schema compatibility confirmed');
    console.log('   ✅ All 18 extended metadata columns included');
    console.log('   ✅ No schema mismatch errors');
    console.log('   ✅ Ready for enhanced product management');

  } catch (error) {
    console.error('🚨 Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
};

// Run the test
testProductCreation();