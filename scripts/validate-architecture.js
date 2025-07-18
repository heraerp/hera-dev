#!/usr/bin/env node
/**
 * HERA Universal Architecture Validation Script
 * Prevents commits that violate architecture patterns
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const VIOLATIONS = [];

/**
 * Check for direct Supabase imports outside approved files
 */
function checkDirectSupabaseUsage() {
  const approvedFiles = [
    'lib/supabase/client.ts',
    'lib/supabase/server.ts',
    'lib/services/universalCrudService.ts',
    'middleware.ts'
  ];

  const files = glob.sync('**/*.{ts,tsx}', { 
    ignore: ['node_modules/**', '.next/**', 'templates/**']
  });

  files.forEach(file => {
    if (approvedFiles.some(approved => file.endsWith(approved))) {
      return; // Skip approved files
    }

    const content = fs.readFileSync(file, 'utf8');
    
    // Check for direct Supabase imports
    if (content.includes("from '@/lib/supabase/client'") || 
        content.includes("from '@/lib/supabase/server'")) {
      VIOLATIONS.push({
        file,
        rule: 'no-direct-supabase',
        message: '🚨 DIRECT SUPABASE USAGE: Use UniversalCrudService instead'
      });
    }

    // Check for backend service imports
    if (content.includes('workflow-orchestrator') || 
        content.includes('erp-integration-service')) {
      VIOLATIONS.push({
        file,
        rule: 'no-backend-services',
        message: '🚨 BACKEND SERVICE USAGE: Use UniversalCrudService instead'
      });
    }
  });
}

/**
 * Check for EntityData interface compliance
 */
function checkEntityDataCompliance() {
  const files = glob.sync('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '.next/**']
  });

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Look for createEntity calls with wrong interface
    if (content.includes('createEntity') && 
        (content.includes('entityName') || content.includes('entityCode'))) {
      VIOLATIONS.push({
        file,
        rule: 'entity-data-compliance',
        message: '🚨 INTERFACE VIOLATION: Use EntityData interface with "name" property'
      });
    }
  });
}

/**
 * Check for UniversalCrudService usage in API routes
 */
function checkAPIRouteCompliance() {
  const apiFiles = glob.sync('app/api/**/route.ts');
  
  apiFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // API routes should use UniversalCrudService for database operations
    if ((content.includes('.from(') || content.includes('supabase.')) &&
        !content.includes('UniversalCrudService')) {
      VIOLATIONS.push({
        file,
        rule: 'api-route-compliance',
        message: '🚨 API ROUTE VIOLATION: Use UniversalCrudService for database operations'
      });
    }
  });
}

/**
 * Main validation
 */
function validateArchitecture() {
  console.log('🔍 Validating HERA Universal Architecture...\n');
  
  checkDirectSupabaseUsage();
  checkEntityDataCompliance();
  checkAPIRouteCompliance();
  
  if (VIOLATIONS.length === 0) {
    console.log('✅ Architecture validation passed!\n');
    return true;
  }
  
  console.log('❌ Architecture violations found:\n');
  
  VIOLATIONS.forEach(violation => {
    console.log(`📄 ${violation.file}`);
    console.log(`   ${violation.message}`);
    console.log(`   Rule: ${violation.rule}\n`);
  });
  
  console.log('💡 Fix these violations before committing.');
  console.log('📚 Check /docs/HERA_ARCHITECTURE_ENFORCEMENT.md for guidance.');
  console.log('🔧 Use templates/crud/ for reference patterns.\n');
  
  return false;
}

// Run validation
if (require.main === module) {
  const isValid = validateArchitecture();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateArchitecture };