#!/usr/bin/env node

/**
 * Demo Script: Test User Management
 * Shows how to create and manage test users programmatically
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 HERA Universal - Test User Demo\n');

// Check if environment is ready
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
} catch (error) {
  console.log('ℹ️ No .env.local file found, using environment variables');
}

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_SERVICE_KEY'
];

const missing = requiredVars.filter(varName => !process.env[varName]);
if (missing.length > 0) {
  console.error('❌ Missing environment variables:', missing.join(', '));
  console.error('Please set up your .env.local file with Supabase credentials');
  process.exit(1);
}

console.log('✅ Environment variables configured');

// Available test commands
const commands = {
  'example-tests': {
    description: 'Run example tests showing test user creation',
    command: 'npx playwright test tests/examples/test-user-examples.spec.ts --headed'
  },
  'restaurant-flow': {
    description: 'Run complete restaurant workflow tests',
    command: 'npx playwright test tests/restaurant-flow-with-test-users.spec.ts --headed'
  },
  'quick-demo': {
    description: 'Run a quick demo test (examples only)',
    command: 'npx playwright test tests/examples/test-user-examples.spec.ts -g "Create and login with a complete test user" --headed'
  },
  'cleanup-test': {
    description: 'Test user cleanup functionality',
    command: 'npx playwright test tests/examples/test-user-examples.spec.ts -g "cleanup and recreation" --headed'
  },
  'load-test': {
    description: 'Run load test with multiple users',
    command: 'npx playwright test tests/examples/test-user-examples.spec.ts -g "Load test with multiple users" --headed'
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help' || command === '--help') {
  console.log('Available commands:\n');
  Object.entries(commands).forEach(([cmd, info]) => {
    console.log(`  npm run demo-test-users ${cmd}`);
    console.log(`    ${info.description}\n`);
  });
  console.log('Examples:');
  console.log('  npm run demo-test-users quick-demo');
  console.log('  npm run demo-test-users restaurant-flow');
  console.log('  npm run demo-test-users load-test\n');
  process.exit(0);
}

if (!commands[command]) {
  console.error(`❌ Unknown command: ${command}`);
  console.error('Run "npm run demo-test-users help" to see available commands');
  process.exit(1);
}

console.log(`🎯 Running: ${commands[command].description}\n`);

try {
  // Change to frontend directory
  process.chdir(path.join(__dirname, '..'));
  
  // Run the command
  execSync(commands[command].command, { 
    stdio: 'inherit',
    env: { 
      ...process.env,
      PLAYWRIGHT_TEST: 'true'
    }
  });
  
  console.log('\n✅ Test completed successfully!');
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}