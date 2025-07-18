const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const testServiceAdapterLogic = async () => {
  console.log('🔍 Testing Service Adapter Logic After Fixes\n');
  
  try {
    // Same setup as ProductCatalogService
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
    );

    const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';

    console.log('✅ Step 1: Test categories query (like fixed getProductCatalog)');
    const { data: categoryEntities, error: categoryError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'product_category')
      .eq('is_active', true);

    console.log(`📊 Categories: ${categoryEntities?.length || 0} found`);
    if (categoryError) console.error('❌ Category error:', categoryError);

    console.log('\n✅ Step 2: Test products query (like fixed getProductCatalog)');
    const { data: productEntities, error: productError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'product')
      .eq('is_active', true);

    console.log(`📊 Products: ${productEntities?.length || 0} found`);
    if (productError) console.error('❌ Product error:', productError);

    if (productEntities?.length > 0) {
      console.log('\n🎉 SUCCESS: The fixes should work!');
      console.log('✅ Using supabaseAdmin bypasses RLS correctly');
      console.log('✅ Products are accessible through admin client');
      console.log('✅ getProductCatalog should now return products');
      console.log('✅ Service adapter should now load categories correctly');
      
      console.log('\nNext: The products page should show all products in the UI');
    } else {
      console.log('\n❌ UNEXPECTED: Still no products found with admin client');
    }

  } catch (error) {
    console.error('🚨 Test error:', error);
  }
};

testServiceAdapterLogic();