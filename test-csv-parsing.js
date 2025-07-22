/**
 * Direct CSV parsing test without server
 * Tests the CSV parsing logic directly
 */

const fs = require('fs');

// Simulate the enhanced CSV parser
function parseCSV(content) {
  // Remove BOM if present
  const cleanContent = content.replace(/^\uFEFF/, '');
  
  const lines = cleanContent.split('\n').filter(line => line.trim());
  const result = [];
  
  for (const line of lines) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Handle escaped quotes ("")
          current += '"';
          i += 2;
          continue;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator outside quotes
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
      
      i++;
    }
    
    // Add the last field
    fields.push(current.trim());
    result.push(fields);
  }
  
  return result;
}

// Test the CSV parsing
function testCSVParsing() {
  const csvPath = '/Users/san/Downloads/mst_ledger 10.csv';
  
  console.log('🧪 Testing CSV Parsing Logic');
  console.log('📁 File:', csvPath);
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ File not found:', csvPath);
    return;
  }
  
  const content = fs.readFileSync(csvPath, 'utf-8');
  console.log('📊 File size:', (content.length / 1024).toFixed(2), 'KB');
  
  // Parse CSV
  const csvData = parseCSV(content);
  console.log('📈 Parsed rows:', csvData.length);
  
  if (csvData.length > 0) {
    console.log('🔍 Headers (' + csvData[0].length + ' columns):', csvData[0]);
    
    if (csvData.length > 1) {
      console.log('🔍 First data row (' + csvData[1].length + ' columns):', csvData[1]);
      
      // Show a few more sample rows
      console.log('\n📋 Sample accounts:');
      for (let i = 1; i <= Math.min(5, csvData.length - 1); i++) {
        const row = csvData[i];
        const accountName = row[0] || 'Unknown';
        const parent = row[1] || 'Unknown';
        const primaryGroup = row[4] || 'Unknown';
        const balance = row[3] || '0';
        
        console.log(`  ${i}. "${accountName}" | Parent: "${parent}" | Group: "${primaryGroup}" | Balance: ${balance}`);
      }
    }
  }
  
  // Test field mapping
  console.log('\n🗺️  Testing Field Mapping:');
  const headers = csvData[0] || [];
  const fieldMapping = {};
  
  // Apply Tally mapping
  const tallyMapping = {
    'gl code name': 'originalName',
    'parent': 'originalType',
    'primarygroup': 'originalCategory',
    'closing_balance': 'balance',
    'opening_balance': 'balance'
  };
  
  headers.forEach(header => {
    const normalizedHeader = header.toLowerCase().replace(/\s+/g, '_');
    
    // Check exact match first
    if (tallyMapping[header]) {
      fieldMapping[header] = tallyMapping[header];
    }
    // Check normalized match
    else if (tallyMapping[normalizedHeader]) {
      fieldMapping[header] = tallyMapping[normalizedHeader];
    }
  });
  
  console.log('Field mapping:', fieldMapping);
  
  // Test account parsing
  if (csvData.length > 1) {
    console.log('\n🧪 Testing Account Parsing:');
    let successCount = 0;
    let errorCount = 0;
    
    // Test first 10 accounts
    for (let i = 1; i <= Math.min(10, csvData.length - 1); i++) {
      const row = csvData[i];
      const rawData = {};
      
      // Map CSV columns to raw data
      headers.forEach((header, index) => {
        if (index < row.length) {
          rawData[header] = row[index];
        }
      });
      
      // Apply field mapping
      const accountData = {
        rowNumber: i,
        rawData
      };
      
      Object.entries(fieldMapping).forEach(([csvField, accountField]) => {
        const csvValue = rawData[csvField];
        if (csvValue !== undefined && csvValue !== null && csvValue !== '') {
          accountData[accountField] = csvValue;
        }
      });
      
      // Validate
      if (!accountData.originalName) {
        console.log(`  ❌ Row ${i}: Missing account name`);
        errorCount++;
      } else {
        console.log(`  ✅ Row ${i}: "${accountData.originalName}" (${accountData.originalType || 'No type'}) - ${accountData.originalCategory || 'No category'}`);
        successCount++;
      }
    }
    
    console.log(`\n📊 Parsing Results: ${successCount} success, ${errorCount} errors out of ${Math.min(10, csvData.length - 1)} tested`);
    
    if (successCount > 0) {
      console.log('✅ CSV parsing is working! The file should import successfully.');
    } else {
      console.log('❌ CSV parsing failed. Need to fix field mapping.');
    }
  }
}

testCSVParsing();