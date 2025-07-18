#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * HERA Universal - Auto-Fix Missing Imports
 * Automatically adds missing createClient imports
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

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Check if file uses createClient
  const usesCreateClient = CREATE_CLIENT_PATTERNS.some(pattern => 
    pattern.test(content)
  );
  
  if (!usesCreateClient) {
    return { changed: false, reason: 'No createClient usage found' };
  }
  
  // Check if file has valid import
  const hasValidImport = VALID_IMPORT_PATTERNS.some(pattern => 
    pattern.test(content)
  );
  
  if (hasValidImport) {
    return { changed: false, reason: 'Import already exists' };
  }
  
  // Find the best place to insert the import
  const importToAdd = "import { createClient } from '@/lib/supabase/client';";
  
  // Find last import line
  let lastImportIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('import{')) {
      lastImportIndex = i;
    }
  }
  
  // Insert the import
  if (lastImportIndex >= 0) {
    // Add after last import
    lines.splice(lastImportIndex + 1, 0, importToAdd);
  } else {
    // Add at the beginning (after any comments)
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*') || line === '') {
        insertIndex = i + 1;
      } else {
        break;
      }
    }
    lines.splice(insertIndex, 0, importToAdd);
  }
  
  // Write the fixed content
  const newContent = lines.join('\n');
  fs.writeFileSync(filePath, newContent, 'utf8');
  
  return { changed: true, reason: 'Added createClient import' };
}

function scanAndFixDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
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
        const result = fixFile(fullPath);
        
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
console.log('🔧 HERA Universal - Auto-Fix Missing Imports');
console.log('============================================');

const startTime = Date.now();
const results = scanAndFixDirectory(process.cwd());

const fixed = results.filter(r => r.changed);
const skipped = results.filter(r => !r.changed);

console.log(`\n📊 Fix Results:`);
console.log(`   Total files scanned: ${results.length}`);
console.log(`   🔧 Files fixed: ${fixed.length}`);
console.log(`   ⏭️  Files skipped: ${skipped.length}`);

if (fixed.length > 0) {
  console.log(`\n✅ Fixed Files:`);
  console.log('===============');
  
  fixed.forEach(result => {
    console.log(`   📄 ${result.file} - ${result.reason}`);
  });
  
  console.log(`\n🎉 Successfully added createClient imports to ${fixed.length} files!`);
  console.log(`\n💡 Next Steps:`);
  console.log('   1. Review the changes');
  console.log('   2. Test your application');
  console.log('   3. Commit the fixes');
} else {
  console.log(`\n🎉 No files needed fixing - all imports are correct!`);
}

const duration = Date.now() - startTime;
console.log(`\n⏱️  Process completed in ${duration}ms`);