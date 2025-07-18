#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * HERA Universal - Import Validation Script
 * Automatically detects missing createClient imports
 */

// Patterns that indicate createClient usage
const CREATE_CLIENT_PATTERNS = [
  /createClient\(\)/g,
  /const supabase = createClient/g,
  /this\.supabase = createClient/g,
  /= createClient\(/g
];

// Valid import patterns
const VALID_IMPORT_PATTERNS = [
  /import.*createClient.*from.*@\/lib\/supabase\/client/,
  /import { createClient } from '@\/lib\/supabase\/client'/,
  /import.*createClient.*from.*'@\/lib\/supabase\/client'/
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Check if file uses createClient
  const usesCreateClient = CREATE_CLIENT_PATTERNS.some(pattern => 
    pattern.test(content)
  );
  
  if (!usesCreateClient) {
    return { valid: true, reason: 'No createClient usage found' };
  }
  
  // Check if file has valid import
  const hasValidImport = VALID_IMPORT_PATTERNS.some(pattern => 
    pattern.test(content)
  );
  
  if (!hasValidImport) {
    // Find which lines use createClient
    const problemLines = [];
    lines.forEach((line, index) => {
      if (CREATE_CLIENT_PATTERNS.some(pattern => pattern.test(line))) {
        problemLines.push({
          lineNumber: index + 1,
          content: line.trim()
        });
      }
    });
    
    return {
      valid: false,
      reason: 'Uses createClient() but missing import',
      problemLines
    };
  }
  
  return { valid: true, reason: 'Valid import found' };
}

function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const results = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .next, .git
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(item)) {
          scan(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        const relativePath = path.relative(process.cwd(), fullPath);
        const result = checkFile(fullPath);
        
        results.push({
          file: relativePath,
          ...result
        });
      }
    }
  }
  
  scan(dir);
  return results;
}

// Main execution
console.log('🔍 HERA Universal - Import Validation');
console.log('=====================================');

const startTime = Date.now();
const results = scanDirectory(process.cwd());

const invalid = results.filter(r => !r.valid);
const valid = results.filter(r => r.valid);

console.log(`\n📊 Scan Results:`);
console.log(`   Total files scanned: ${results.length}`);
console.log(`   ✅ Valid files: ${valid.length}`);
console.log(`   ❌ Invalid files: ${invalid.length}`);

if (invalid.length > 0) {
  console.log(`\n🚨 Missing createClient Imports:`);
  console.log('=================================');
  
  invalid.forEach(result => {
    console.log(`\n📄 ${result.file}`);
    console.log(`   Issue: ${result.reason}`);
    
    if (result.problemLines) {
      console.log(`   Problem lines:`);
      result.problemLines.forEach(line => {
        console.log(`     Line ${line.lineNumber}: ${line.content}`);
      });
    }
    
    console.log(`   Fix: Add this import at the top:`);
    console.log(`     import { createClient } from '@/lib/supabase/client';`);
  });
  
  console.log(`\n💡 Quick Fix Script:`);
  console.log('===================');
  console.log('Run this to fix all missing imports:');
  console.log('node scripts/fix-missing-imports.js');
  
  process.exit(1);
} else {
  console.log(`\n🎉 All files have correct createClient imports!`);
}

const duration = Date.now() - startTime;
console.log(`\n⏱️  Scan completed in ${duration}ms`);