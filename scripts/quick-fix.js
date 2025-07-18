#!/usr/bin/env node
/**
 * HERA Quick Fix Tool
 * Auto-fixes common architecture violations
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Auto-fix direct Supabase imports
 */
function fixDirectSupabaseImports(content) {
  let fixed = content;
  
  // Replace direct Supabase imports
  fixed = fixed.replace(
    /import\s+{\s*createClient\s*}\s+from\s+['"]@\/lib\/supabase\/(client|server)['"]/g,
    "import UniversalCrudService from '@/lib/services/universalCrudService'"
  );
  
  // Replace supabase.from() calls with Universal CRUD suggestions
  if (fixed.includes('supabase.from(')) {
    fixed = `// 🔧 AUTO-FIX NEEDED: Replace supabase.from() calls with UniversalCrudService\n// Example: const result = await UniversalCrudService.listEntities(organizationId, 'entity_type')\n\n${fixed}`;
  }
  
  return fixed;
}

/**
 * Auto-fix EntityData interface violations
 */
function fixEntityDataInterface(content) {
  let fixed = content;
  
  // Fix entityName to name
  fixed = fixed.replace(/entityName:/g, 'name:');
  fixed = fixed.replace(/entityName\s*=/g, 'name =');
  
  // Remove entityCode (auto-generated)
  fixed = fixed.replace(/,?\s*entityCode:\s*[^,}]+/g, '');
  
  return fixed;
}

/**
 * Auto-fix a single file
 */
function fixFile(filePath) {
  const approvedFiles = [
    'lib/supabase/client.ts',
    'lib/supabase/server.ts', 
    'lib/services/universalCrudService.ts',
    'middleware.ts'
  ];

  // Skip approved files
  if (approvedFiles.some(approved => filePath.endsWith(approved))) {
    return false;
  }

  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let fixedContent = originalContent;
    
    fixedContent = fixDirectSupabaseImports(fixedContent);
    fixedContent = fixEntityDataInterface(fixedContent);
    
    if (fixedContent !== originalContent) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`🔧 Fixed: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
  
  return false;
}

/**
 * Auto-fix all files
 */
function fixAllFiles() {
  console.log('🔧 HERA Quick Fix Tool - Auto-fixing common violations...\n');
  
  const files = glob.sync('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '.next/**', 'templates/**']
  });
  
  let fixedCount = 0;
  
  files.forEach(file => {
    if (fixFile(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\n✅ Auto-fixed ${fixedCount} files`);
  console.log('💡 Some violations may need manual review');
  console.log('📚 Check docs/HERA_ARCHITECTURE_ENFORCEMENT.md for patterns\n');
}

// Run if called directly
if (require.main === module) {
  const targetFile = process.argv[2];
  
  if (targetFile) {
    fixFile(targetFile);
  } else {
    fixAllFiles();
  }
}

module.exports = { fixFile, fixAllFiles };