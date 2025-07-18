const { ProductCatalogService } = require('./lib/services/productCatalogService.ts');
require('dotenv').config({ path: '.env.local' });

const testGetProductCatalog = async () => {
  console.log('🔍 Testing Fixed ProductCatalogService.getProductCatalog\n');
  
  try {
    const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';
    
    console.log('🔄 Calling ProductCatalogService.getProductCatalog...');
    const result = await ProductCatalogService.getProductCatalog(organizationId);
    
    console.log('📊 Result:', {
      success: result.success,
      productsCount: result.data?.products?.length || 0,
      categoriesCount: result.data?.categories?.length || 0,
      error: result.error
    });
    
    if (result.success && result.data?.products?.length > 0) {
      console.log('\n✅ SUCCESS: Products are now loading correctly!');
      console.log('First 3 products:');
      result.data.products.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.entity_name || product.name} (${product.id})`);
      });
    } else {
      console.log('❌ STILL FAILING: Products not loading');
      if (result.error) {
        console.log('Error:', result.error);
      }
    }
    
  } catch (error) {
    console.error('🚨 Test error:', error);
  }
};

testGetProductCatalog();