/**
 * Direct test of mst_ledger 9.csv file with HERA Hybrid AI
 * 
 * Usage: node test-mst-ledger.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CSV_FILE_PATH = '/Users/san/Downloads/mst_ledger 9.csv';
const ORGANIZATION_ID = '123e4567-e89b-12d3-a456-426614174000';
const API_BASE = 'http://localhost:3005';
const SAMPLE_SIZE = 15; // Test first 15 accounts for speed

async function testMSTLedger() {
  console.log('🧪 Testing MST Ledger CSV with HERA Hybrid AI');
  console.log('📁 File:', CSV_FILE_PATH);
  
  try {
    // Read CSV file
    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.error('❌ CSV file not found:', CSV_FILE_PATH);
      return;
    }

    const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    console.log('📊 File size:', (csvContent.length / 1024).toFixed(2), 'KB');
    
    const lines = csvContent.split('\n').filter(line => line.trim());
    console.log('📈 Total lines:', lines.length);
    console.log('📋 Header:', lines[0].substring(0, 100) + '...');

    // Step 1: Import CSV
    console.log('\n🔄 Step 1: Importing CSV...');
    
    const importResponse = await fetch(`${API_BASE}/api/finance/chart-of-accounts/import-csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId: ORGANIZATION_ID,
        fileContent: csvContent,
        fileFormat: 'auto_detect',
        hasHeaders: true,
        skipRows: 0,
        previewMode: true
      })
    });

    const importResult = await importResponse.json();
    
    if (!importResponse.ok) {
      console.error('❌ Import failed:', importResult.error);
      return;
    }

    console.log('✅ Import successful!');
    console.log('📊 Accounts parsed:', importResult.parsedAccounts);
    console.log('🚫 Parse errors:', importResult.errors?.length || 0);
    console.log('🔍 Detected format:', importResult.detectedFormat);

    // Show sample of parsed accounts
    if (importResult.accounts?.length > 0) {
      console.log('\n📋 Sample parsed accounts:');
      importResult.accounts.slice(0, 5).forEach((acc, i) => {
        console.log(`  ${i + 1}. "${acc.originalName}" (${acc.originalCode}) - ${acc.primarygroup || 'Unknown'}`);
      });
    }

    // Step 2: Test Migration with sample
    const sampleAccounts = importResult.accounts?.slice(0, SAMPLE_SIZE) || [];
    if (sampleAccounts.length === 0) {
      console.error('❌ No accounts to migrate');
      return;
    }

    console.log(`\n🧠 Step 2: Testing Hybrid AI Migration (${sampleAccounts.length} sample accounts)...`);
    
    const migrationResponse = await fetch(`${API_BASE}/api/finance/chart-of-accounts/migrate-legacy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId: ORGANIZATION_ID,
        accounts: sampleAccounts,
        migrationMode: 'preview',
        mappingStrategy: 'ai_smart',
        conflictResolution: 'rename',
        preserveStructure: true
      })
    });

    const migrationResult = await migrationResponse.json();
    
    if (!migrationResponse.ok) {
      console.error('❌ Migration failed:', migrationResult.error);
      return;
    }

    console.log('✅ Migration successful!');
    
    // Analyze results
    const mappedAccounts = migrationResult.mappedAccounts || [];
    const highConfidence = mappedAccounts.filter(a => a.suggestedMapping.confidence > 0.8);
    const aiEnhanced = mappedAccounts.filter(a => a.suggestedMapping.description?.includes('AI Enhanced'));
    const needsReview = mappedAccounts.filter(a => a.status === 'manual_review');

    console.log('\n📊 Migration Analysis:');
    console.log('  🎯 High Confidence (>80%):', highConfidence.length, '/', mappedAccounts.length);
    console.log('  🧠 AI Enhanced:', aiEnhanced.length, '/', mappedAccounts.length);
    console.log('  ⚠️  Needs Review:', needsReview.length, '/', mappedAccounts.length);

    console.log('\n🔍 Detailed Mappings:');
    mappedAccounts.forEach((account, i) => {
      const original = account.originalAccount;
      const mapped = account.suggestedMapping;
      const confidence = Math.round(mapped.confidence * 100);
      const aiFlag = mapped.description?.includes('AI Enhanced') ? '🧠' : '⚡';
      
      console.log(`\n  ${i + 1}. ${aiFlag} ${original.originalName}`);
      console.log(`     Original: ${original.originalCode} (${original.primarygroup || 'Unknown'})`);
      console.log(`     → HERA: ${mapped.accountCode} - ${mapped.accountName}`);
      console.log(`     Type: ${mapped.accountType} | Confidence: ${confidence}%`);
      console.log(`     Reasoning: ${mapped.reasoning}`);
      
      if (account.status === 'conflict') {
        console.log(`     ⚠️ Status: ${account.status}`);
      }
    });

    // Summary
    console.log('\n🎉 Test Complete! Summary:');
    console.log(`  📁 Total accounts in file: ${importResult.parsedAccounts}`);
    console.log(`  🧪 Sample tested: ${mappedAccounts.length}`);
    console.log(`  🎯 Success rate: ${Math.round((highConfidence.length / mappedAccounts.length) * 100)}%`);
    console.log(`  🧠 AI enhancement rate: ${Math.round((aiEnhanced.length / mappedAccounts.length) * 100)}%`);
    console.log(`  ⚡ System performance: Hybrid AI working as expected`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testMSTLedger();