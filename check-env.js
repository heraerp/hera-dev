import { createClient } from '@/lib/supabase/client';
#!/usr/bin/env node

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

// Load .env.local file if it exists
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  console.log('✅ Loaded environment variables from .env.local');
}

console.log('🔍 Checking Environment Variables for Supabase...');
console.log('================================================');

// List all environment variables that contain 'supabase' or 'SUPABASE'
const envVars = Object.keys(process.env).filter(key => 
  key.toLowerCase().includes('supabase')
);

console.log('📋 Supabase-related environment variables found:');
envVars.forEach(key => {
  const value = process.env[key];
  const maskedValue = value ? 
    value.substring(0, 10) + '***' + value.substring(value.length - 5) : 
    'undefined';
  console.log(`   ${key}: ${maskedValue}`);
});

// Check specific required variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'NEXT_PUBLIC_SUPABASE_SERVICE_KEY'  // Updated to match actual env var name
];

console.log('\n🔑 Required Variables Check:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ SET' : '❌ MISSING';
  const length = value ? `(${value.length} chars)` : '';
  console.log(`   ${varName}: ${status} ${length}`);
});

// Check if we can create Supabase client
console.log('\n🧪 Supabase Client Test:');
try {
  const { createClient } = require('@supabase/supabase-js');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
  
  if (url && anonKey) {
    const anonClient = createClient(url, anonKey);
    console.log('✅ Anon client: Successfully created');
  } else {
    console.log('❌ Anon client: Cannot create (missing URL or anon key)');
  }
  
  if (url && serviceKey) {
    const serviceClient = createClient(url, serviceKey);
    console.log('✅ Service client: Successfully created');
  } else {
    console.log('❌ Service client: Cannot create (missing URL or service key)');
  }
  
} catch (error) {
  console.log('❌ Client creation failed:', error.message);
}

console.log('\n💡 Instructions:');
if (!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_SERVICE_KEY is missing');
  console.log('   Please set this environment variable with your Supabase service role key');
  console.log('   You can find it in your Supabase project settings under API keys');
  console.log('   Example: export NEXT_PUBLIC_SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."');
} else {
  console.log('✅ All required environment variables are set');
  console.log('   The restaurant setup API should work correctly');
}