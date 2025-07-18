#!/usr/bin/env node
/**
 * HERA Development Helper
 * Interactive tool for HERA Universal patterns
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const PATTERNS = {
  entityCreation: `// ✅ HERA Universal Entity Creation Pattern
const entityData: EntityData = {
  name: "Product Name",           // REQUIRED
  organizationId: "org-123",      // OPTIONAL
  fields: {                       // OPTIONAL
    price: 9.99,
    description: "Product description"
  }
}

const result = await UniversalCrudService.createEntity(entityData, 'product')`,

  entityReading: `// ✅ HERA Universal Entity Reading Pattern
const entity = await UniversalCrudService.readEntity(organizationId, entityId)

// Or list entities
const entities = await UniversalCrudService.listEntities(organizationId, 'product', {
  page: 1,
  pageSize: 25,
  search: 'query',
  filters: { category: 'electronics' }
})`,

  apiRoute: `// ✅ HERA Universal API Route Pattern
import { NextRequest, NextResponse } from 'next/server'
import UniversalCrudService from '@/lib/services/universalCrudService'

export async function POST(request: NextRequest) {
  const data = await request.json()
  
  const result = await UniversalCrudService.createEntity(data, 'entity_type')
  
  return NextResponse.json(result)
}`,

  imports: `// ✅ HERA Universal Imports
import UniversalCrudService from '@/lib/services/universalCrudService'
import { HeraNamingConventionAI } from '@/lib/naming/heraNamingConvention'

// ❌ NEVER USE THESE
// import { createClient } from '@/lib/supabase/client'
// import { workflowOrchestrator } from '@/lib/scanner'`
};

function showMenu() {
  console.log('\n🎯 HERA Universal Development Helper\n');
  console.log('1. Entity Creation Pattern');
  console.log('2. Entity Reading Pattern'); 
  console.log('3. API Route Pattern');
  console.log('4. Correct Imports');
  console.log('5. Quick Architecture Check');
  console.log('6. Start Real-time Watcher');
  console.log('7. Auto-fix Violations');
  console.log('q. Quit\n');
}

function showPattern(patternKey) {
  console.log('\n' + '='.repeat(60));
  console.log(PATTERNS[patternKey]);
  console.log('='.repeat(60) + '\n');
}

function quickCheck() {
  console.log('\n🔍 Quick Architecture Check:\n');
  console.log('✅ Am I using UniversalCrudService?');
  console.log('✅ Do I have "name" property (not entityName)?');
  console.log('✅ Did I check templates/crud/ first?');
  console.log('✅ Am I avoiding direct Supabase imports?');
  console.log('✅ Is organizationId the first parameter?\n');
}

function startInteractive() {
  showMenu();
  
  rl.question('Choose an option: ', (answer) => {
    switch(answer.toLowerCase()) {
      case '1':
        showPattern('entityCreation');
        break;
      case '2':
        showPattern('entityReading');
        break;
      case '3':
        showPattern('apiRoute');
        break;
      case '4':
        showPattern('imports');
        break;
      case '5':
        quickCheck();
        break;
      case '6':
        console.log('\n🚀 Starting real-time architecture watcher...');
        require('./watch-architecture').startWatcher();
        return;
      case '7':
        console.log('\n🔧 Running auto-fix...');
        require('./quick-fix').fixAllFiles();
        break;
      case 'q':
        console.log('\n👋 Happy coding with HERA Universal!');
        rl.close();
        return;
      default:
        console.log('\n❌ Invalid option');
    }
    
    // Show menu again unless quitting or watching
    if (answer !== '6') {
      setTimeout(() => startInteractive(), 1000);
    }
  });
}

// Run if called directly
if (require.main === module) {
  startInteractive();
}

module.exports = { showPattern, quickCheck };