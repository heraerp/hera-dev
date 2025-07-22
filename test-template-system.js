/**
 * Test Claude COA Template System
 * 
 * Tests template generation, storage, and retrieval
 * Run with: node test-template-system.js
 */

require('dotenv').config();

const testTemplateAPI = async () => {
  console.log('🧠 Testing Claude COA Template System\n');

  const baseURL = 'http://localhost:3000';
  
  try {
    // Test 1: List existing templates
    console.log('1️⃣ Testing template listing...');
    const listResponse = await fetch(`${baseURL}/api/finance/chart-of-accounts/generate-template`);
    const listResult = await listResponse.json();
    
    console.log('   Status:', listResponse.status);
    console.log('   Templates found:', listResult.data?.templates?.length || 0);
    
    if (listResult.data?.templates?.length > 0) {
      console.log('   Latest template:', listResult.data.templates[0].entity_code);
    }

    // Test 2: Generate new restaurant template
    console.log('\n2️⃣ Testing template generation...');
    const generateResponse = await fetch(`${baseURL}/api/finance/chart-of-accounts/generate-template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessType: 'restaurant',
        businessDetails: {
          cuisineType: ['italian', 'american'],
          services: ['dine-in', 'takeout', 'delivery', 'catering'],
          size: 'medium',
          locations: 2,
          specialRequirements: ['bar', 'bakery']
        },
        regenerate: false
      })
    });

    const generateResult = await generateResponse.json();
    
    console.log('   Status:', generateResponse.status);
    console.log('   Success:', generateResult.success);
    console.log('   Source:', generateResult.data?.source); // 'generated' or 'cached'
    
    if (generateResult.data?.template) {
      const template = generateResult.data.template;
      console.log('   Template ID:', template.templateId);
      console.log('   Total accounts:', template.accounts?.length || 0);
      console.log('   Business type:', template.businessType);
      
      if (template.metadata?.categories) {
        console.log('   Categories:');
        Object.entries(template.metadata.categories).forEach(([category, count]) => {
          console.log(`     ${category}: ${count} accounts`);
        });
      }
      
      // Show sample accounts
      if (template.accounts?.length > 0) {
        console.log('   Sample accounts:');
        template.accounts.slice(0, 3).forEach((account, i) => {
          console.log(`     ${i + 1}. ${account.accountCode} - ${account.accountName} (${account.accountType})`);
          console.log(`        ${account.description}`);
          if (account.keywords) {
            console.log(`        Keywords: ${account.keywords.join(', ')}`);
          }
        });
      }
    }

    // Test 3: Load specific template
    console.log('\n3️⃣ Testing template loading...');
    const loadResponse = await fetch(`${baseURL}/api/finance/chart-of-accounts/generate-template?businessType=restaurant`);
    const loadResult = await loadResponse.json();
    
    console.log('   Status:', loadResponse.status);
    console.log('   Success:', loadResult.success);
    
    if (loadResult.data?.template) {
      console.log('   Loaded template:', loadResult.data.template.templateId);
      console.log('   Accounts count:', loadResult.data.template.accounts?.length || 0);
    }

    // Test 4: Test template-enhanced migration
    console.log('\n4️⃣ Testing template-enhanced migration...');
    const testAccounts = [
      { originalCode: '1000', originalName: 'Cash', originalType: 'Asset' },
      { originalCode: '4000', originalName: 'Sales Revenue', originalType: 'Income' },
      { originalCode: '5000', originalName: 'Food Cost', originalType: 'Expense' },
      { originalCode: '6000', originalName: 'Labor Cost', originalType: 'Expense' },
      { originalCode: '7000', originalName: 'Rent Expense', originalType: 'Expense' }
    ];

    const migrateResponse = await fetch(`${baseURL}/api/finance/chart-of-accounts/migrate-legacy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId: '123e4567-e89b-12d3-a456-426614174000',
        accounts: testAccounts,
        migrationMode: 'preview',
        mappingStrategy: 'ai_smart',
        conflictResolution: 'rename',
        preserveStructure: true
      })
    });

    const migrateResult = await migrateResponse.json();
    
    console.log('   Status:', migrateResponse.status);
    console.log('   Success:', migrateResult.success);
    
    if (migrateResult.data?.mappedAccounts) {
      console.log('   Mapped accounts:', migrateResult.data.mappedAccounts.length);
      
      migrateResult.data.mappedAccounts.forEach((mapped, i) => {
        const isTemplate = mapped.suggestedMapping.reasoning.includes('Template');
        const prefix = isTemplate ? '🎯' : '🧠';
        
        console.log(`   ${prefix} ${mapped.originalAccount.originalName} → ${mapped.suggestedMapping.accountName}`);
        console.log(`      ${mapped.suggestedMapping.accountCode} (${(mapped.suggestedMapping.confidence * 100).toFixed(0)}%)`);
        console.log(`      ${mapped.suggestedMapping.reasoning}`);
      });

      const templateCount = migrateResult.data.mappedAccounts.filter(m => 
        m.suggestedMapping.reasoning.includes('Template')).length;
      const aiCount = migrateResult.data.mappedAccounts.filter(m => 
        m.suggestedMapping.reasoning.includes('AI')).length;
      
      console.log(`   Template-based: ${templateCount}, AI-based: ${aiCount}`);
    }

    console.log('\n✅ Template system test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Template system test failed:', error);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure the development server is running:');
      console.log('   npm run dev');
    }
    
    if (error.message.includes('ANTHROPIC_API_KEY')) {
      console.log('\n💡 Make sure Claude API key is configured:');
      console.log('   export ANTHROPIC_API_KEY=your_key_here');
    }
  }
};

// Run the test
testTemplateAPI();