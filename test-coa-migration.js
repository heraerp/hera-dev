/**
 * Test script for Chart of Accounts CSV migration
 * 
 * Usage: node test-coa-migration.js
 */

const fs = require('fs');
const path = require('path');

// Mario's restaurant organization ID
const ORGANIZATION_ID = '123e4567-e89b-12d3-a456-426614174000';

// Create a sample CSV file
const sampleCSV = `Account Code,Account Name,Account Type,Description
1000,Cash,Asset,Operating cash accounts
1100,Accounts Receivable,Asset,Customer receivables
2000,Accounts Payable,Liability,Vendor payables
3000,Owner's Equity,Equity,Owner capital accounts
4000,Sales Revenue,Revenue,Restaurant sales
5000,Food Cost,Cost of Sales,Direct food costs
6000,Labor Cost,Direct Expense,Kitchen staff wages
7000,Rent Expense,Indirect Expense,Monthly rent
8000,Sales Tax Payable,Tax Expense,Sales tax collected`;

// Save sample CSV
fs.writeFileSync('sample-coa.csv', sampleCSV);
console.log('Created sample-coa.csv');

// Test the import endpoint
async function testImport() {
  try {
    // First, parse the CSV
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream('sample-coa.csv'));
    form.append('organizationId', ORGANIZATION_ID);

    console.log('\n1. Testing CSV Import...');
    const importResponse = await fetch('http://localhost:3005/api/finance/chart-of-accounts/import-csv', {
      method: 'POST',
      body: form
    });

    const importResult = await importResponse.json();
    console.log('Import Result:', JSON.stringify(importResult, null, 2));

    // If import successful, test migration
    if (importResult.success) {
      console.log('\n2. Testing Legacy Migration...');
      const migrationResponse = await fetch('http://localhost:3005/api/finance/chart-of-accounts/migrate-legacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organizationId: ORGANIZATION_ID,
          accounts: importResult.data,
          options: {
            preserveCodes: true,
            suggestMissing: true,
            validateCompliance: true
          }
        })
      });

      const migrationResult = await migrationResponse.json();
      console.log('Migration Result:', JSON.stringify(migrationResult, null, 2));
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
console.log('Testing Chart of Accounts Migration...');
console.log('Organization ID:', ORGANIZATION_ID);
testImport();