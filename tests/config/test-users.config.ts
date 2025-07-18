/**
 * Test User Configuration
 * Centralized configuration for test users and environment setup
 */

export const TEST_CONFIG = {
  // Supabase settings
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Application URLs
  urls: {
    base: 'http://localhost:3002',
    login: 'http://localhost:3002/login',
    restaurant: 'http://localhost:3002/restaurant',
    setup: 'http://localhost:3002/setup/restaurant',
  },

  // Default test user settings
  defaultUser: {
    password: 'TestPassword123!',
    domain: 'hera-test.com',
  },

  // Test data templates
  restaurantTemplates: {
    pizza: {
      name: 'Test Pizza Palace',
      industry: 'restaurant',
      cuisine: 'Italian',
      seatingCapacity: 50,
    },
    cafe: {
      name: 'Test Coffee Shop',
      industry: 'restaurant',
      cuisine: 'Cafe',
      seatingCapacity: 30,
    },
    fastFood: {
      name: 'Test Burger Joint',
      industry: 'restaurant',
      cuisine: 'Fast Food',
      seatingCapacity: 40,
    },
  },

  // Test timeouts
  timeouts: {
    login: 30000,
    navigation: 15000,
    apiCall: 10000,
    cleanup: 30000,
  },

  // Environment checks
  isTestEnvironment: () => {
    return process.env.NODE_ENV === 'test' || 
           process.env.PLAYWRIGHT_TEST === 'true' ||
           process.env.CI === 'true';
  },

  // Required environment variables
  requiredEnvVars: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_SERVICE_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ],

  // Validate environment
  validateEnvironment: () => {
    const missing = TEST_CONFIG.requiredEnvVars.filter(
      varName => !process.env[varName]
    );

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env.local file.'
      );
    }

    if (!TEST_CONFIG.isTestEnvironment()) {
      console.warn(
        '⚠️ Warning: Running tests outside of test environment. ' +
        'Set NODE_ENV=test or PLAYWRIGHT_TEST=true for safer testing.'
      );
    }

    return true;
  },
};

// Validate environment on import
TEST_CONFIG.validateEnvironment();