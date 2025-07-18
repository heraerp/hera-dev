/**
 * Test template download functionality for menu items
 */

// Test the template download API endpoint
async function testTemplateDownload() {
  console.log('🧪 Testing Menu Items Template Download');
  console.log('=' .repeat(50));
  
  try {
    // Test the API endpoint
    const response = await fetch('http://localhost:3003/api/universal-bulk-upload?action=template&entityType=menu_items');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Template API Response:', result);
    
    if (result.template) {
      console.log('\n📋 Template Information:');
      console.log(`   Name: ${result.template.name}`);
      console.log(`   Entity Type: ${result.template.entityType}`);
      console.log(`   Entity Label: ${result.template.entityLabel}`);
      console.log(`   Total Fields: ${result.template.fields.length}`);
      
      // Show required fields
      const requiredFields = result.template.fields.filter(f => f.required);
      console.log(`   Required Fields (${requiredFields.length}):`, requiredFields.map(f => f.label).join(', '));
      
      // Show optional fields
      const optionalFields = result.template.fields.filter(f => !f.required);
      console.log(`   Optional Fields (${optionalFields.length}):`, optionalFields.map(f => f.label).join(', '));
      
      console.log('\n📊 Field Details:');
      result.template.fields.forEach((field, index) => {
        console.log(`   ${index + 1}. ${field.label} (${field.key})`);
        console.log(`      Type: ${field.type} | Required: ${field.required}`);
        console.log(`      Description: ${field.description}`);
        if (field.options) {
          console.log(`      Options: ${field.options.join(', ')}`);
        }
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Template download test failed:', error);
  }
}

// Test the client-side template generation
async function testClientTemplateGeneration() {
  console.log('🧪 Testing Client-Side Template Generation');
  console.log('=' .repeat(50));
  
  try {
    // Import the service (this would work in a browser environment)
    const { default: UniversalBulkUploadService } = await import('./lib/services/universalBulkUploadService.js');
    
    // Test get entity config
    const config = UniversalBulkUploadService.getEntityConfig('menu_items');
    if (config) {
      console.log('✅ Menu items configuration found');
      console.log(`   Template Name: ${config.templateName}`);
      console.log(`   Entity Type: ${config.entityType}`);
      console.log(`   API Endpoint: ${config.apiEndpoint}`);
      
      // Test available entity types
      const availableTypes = UniversalBulkUploadService.getAvailableEntityTypes();
      console.log('✅ Available entity types:', availableTypes);
      
      // Test template generation (this would download in browser)
      console.log('🔄 Generating Excel template...');
      UniversalBulkUploadService.generateExcelTemplate('menu_items');
      
    } else {
      console.error('❌ Menu items configuration not found');
    }
    
  } catch (error) {
    console.error('❌ Client template generation test failed:', error);
  }
}

// Run tests
console.log('🚀 Starting Template Download Tests\n');

// Test both methods
testTemplateDownload().then(() => {
  console.log('\n' + '='.repeat(50));
  return testClientTemplateGeneration();
}).then(() => {
  console.log('\n✅ All template download tests completed!');
  console.log('🎯 Template should be available for download from the UI');
}).catch(error => {
  console.error('❌ Test suite failed:', error);
});