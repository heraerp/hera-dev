#!/usr/bin/env node
/**
 * HERA Universal Architecture Real-Time Watcher
 * Provides instant feedback during development without blocking commits
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

let violations = new Map();

/**
 * Check file for HERA architecture violations
 */
function checkFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  
  const approvedFiles = [
    'lib/supabase/client.ts',
    'lib/supabase/server.ts', 
    'lib/services/universalCrudService.ts',
    'middleware.ts'
  ];

  // Skip approved files and templates
  if (approvedFiles.some(approved => filePath.endsWith(approved)) || 
      filePath.includes('/templates/')) {
    violations.delete(filePath);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileViolations = [];

    // Check for direct Supabase imports
    if (content.includes("from '@/lib/supabase/client'") || 
        content.includes("from '@/lib/supabase/server'")) {
      fileViolations.push({
        type: 'direct-supabase',
        message: '🚨 Use UniversalCrudService instead of direct Supabase',
        suggestion: "import UniversalCrudService from '@/lib/services/universalCrudService'"
      });
    }

    // Check for backend service imports
    if (content.includes('workflow-orchestrator') || 
        content.includes('erp-integration-service')) {
      fileViolations.push({
        type: 'backend-service',
        message: '🚨 Use UniversalCrudService instead of backend services',
        suggestion: 'Replace with UniversalCrudService.createEntity(data, type)'
      });
    }

    // Check for wrong EntityData interface usage
    if (content.includes('createEntity') && 
        (content.includes('entityName:') || content.includes('entityCode:'))) {
      fileViolations.push({
        type: 'wrong-interface',
        message: '🚨 Use "name" property in EntityData interface',
        suggestion: 'Change entityName to name: string'
      });
    }

    // Check API routes for direct Supabase usage
    if (filePath.includes('/api/') && 
        (content.includes('.from(') || content.includes('supabase.')) &&
        !content.includes('UniversalCrudService')) {
      fileViolations.push({
        type: 'api-route',
        message: '🚨 API routes should use UniversalCrudService',
        suggestion: 'Replace Supabase queries with UniversalCrudService methods'
      });
    }

    if (fileViolations.length > 0) {
      violations.set(filePath, fileViolations);
      showViolations(filePath, fileViolations);
    } else {
      if (violations.has(filePath)) {
        violations.delete(filePath);
        console.log(`✅ ${filePath} - Architecture violations fixed!`);
      }
    }
  } catch (error) {
    // File might be temporarily unavailable during editing
  }
}

/**
 * Show violations for a file
 */
function showViolations(filePath, fileViolations) {
  console.log(`\n📄 ${filePath}`);
  fileViolations.forEach(violation => {
    console.log(`   ${violation.message}`);
    console.log(`   💡 ${violation.suggestion}`);
  });
  console.log(`   📚 Check templates/crud/ for patterns\n`);
}

/**
 * Show summary of all violations
 */
function showSummary() {
  const totalViolations = Array.from(violations.values()).flat().length;
  
  if (totalViolations === 0) {
    console.log('✅ No HERA architecture violations detected!');
    return;
  }

  console.log(`\n📊 HERA Architecture Summary: ${totalViolations} violations in ${violations.size} files`);
  console.log('🔧 Fix suggestions provided above');
  console.log('📚 Reference: docs/HERA_ARCHITECTURE_ENFORCEMENT.md\n');
}

/**
 * Start watching files
 */
function startWatcher() {
  console.log('👀 HERA Architecture Watcher started...');
  console.log('💡 Real-time feedback on architecture violations');
  console.log('🚀 No commit blocking - just helpful suggestions!\n');

  // Watch TypeScript files
  const watcher = chokidar.watch('**/*.{ts,tsx}', {
    ignored: ['node_modules/**', '.next/**', 'dist/**'],
    persistent: true
  });

  watcher
    .on('change', checkFile)
    .on('add', checkFile)
    .on('unlink', (filePath) => {
      violations.delete(filePath);
    });

  // Show summary every 30 seconds if there are violations
  setInterval(() => {
    if (violations.size > 0) {
      showSummary();
    }
  }, 30000);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 HERA Architecture Watcher stopped');
    watcher.close();
    process.exit(0);
  });
}

// Run if called directly
if (require.main === module) {
  startWatcher();
}

module.exports = { checkFile, startWatcher };