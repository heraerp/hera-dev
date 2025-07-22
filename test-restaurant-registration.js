/**
 * Test Script for Restaurant Registration Flow
 * Tests the unified registration that creates Supabase + Restaurant users
 */

const TEST_API_URL = 'http://localhost:3000/api/auth/register-restaurant';

// Test data
const testRegistrations = [
  {
    restaurantName: "Luigi's Pizza Palace",
    email: 'luigi@pizzapalace.com',
    password: 'testpass123',
    role: 'owner',
    phone: '+1-555-0123'
  },
  {
    restaurantName: 'The Green Garden Cafe',
    email: 'manager@greengarden.com',
    password: 'testpass456',
    role: 'manager'
  }
];

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Helper function to make API requests
async function testRegistration(data) {
  console.log(`\n${colors.blue}Testing registration for: ${data.restaurantName}${colors.reset}`);
  console.log('Data:', JSON.stringify(data, null, 2));

  try {
    const response = await fetch(TEST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        timezone: 'America/New_York'
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`${colors.green}✓ Registration successful!${colors.reset}`);
      console.log('Response:', JSON.stringify(result, null, 2));
      return { success: true, data: result };
    } else {
      console.log(`${colors.red}✗ Registration failed!${colors.reset}`);
      console.log('Error:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log(`${colors.red}✗ Network error!${colors.reset}`);
    console.log('Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Test duplicate registration
async function testDuplicateRegistration() {
  console.log(`\n${colors.yellow}Testing duplicate registration...${colors.reset}`);
  
  const duplicateData = {
    restaurantName: "Duplicate Restaurant",
    email: 'duplicate@test.com',
    password: 'testpass789',
    role: 'owner'
  };

  // First registration
  const first = await testRegistration(duplicateData);
  
  if (first.success) {
    // Try to register again with same email
    console.log(`\n${colors.yellow}Attempting duplicate registration with same email...${colors.reset}`);
    const second = await testRegistration(duplicateData);
    
    if (!second.success) {
      console.log(`${colors.green}✓ Duplicate prevention working correctly${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Duplicate prevention failed!${colors.reset}`);
    }
  }
}

// Test validation
async function testValidation() {
  console.log(`\n${colors.yellow}Testing validation...${colors.reset}`);
  
  const invalidTests = [
    {
      name: 'Missing restaurant name',
      data: { email: 'test@test.com', password: 'testpass', role: 'owner' }
    },
    {
      name: 'Missing email',
      data: { restaurantName: 'Test Restaurant', password: 'testpass', role: 'owner' }
    },
    {
      name: 'Invalid email format',
      data: { restaurantName: 'Test Restaurant', email: 'notanemail', password: 'testpass', role: 'owner' }
    },
    {
      name: 'Short password',
      data: { restaurantName: 'Test Restaurant', email: 'test@test.com', password: '123', role: 'owner' }
    }
  ];

  for (const test of invalidTests) {
    console.log(`\n${colors.blue}Testing: ${test.name}${colors.reset}`);
    const result = await testRegistration(test.data);
    
    if (!result.success) {
      console.log(`${colors.green}✓ Validation working correctly${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Validation failed - should have rejected this data${colors.reset}`);
    }
  }
}

// Main test runner
async function runTests() {
  console.log(`${colors.blue}========================================`);
  console.log('Restaurant Registration Test Suite');
  console.log(`========================================${colors.reset}`);

  // Check if server is running
  try {
    await fetch('http://localhost:3000');
  } catch (error) {
    console.log(`${colors.red}Error: Server is not running on http://localhost:3000${colors.reset}`);
    console.log('Please start the development server with: npm run dev');
    return;
  }

  let successCount = 0;
  let failureCount = 0;

  // Test successful registrations
  for (const data of testRegistrations) {
    const result = await testRegistration(data);
    if (result.success) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  // Test duplicate prevention
  await testDuplicateRegistration();

  // Test validation
  await testValidation();

  // Summary
  console.log(`\n${colors.blue}========================================`);
  console.log('Test Summary');
  console.log(`========================================${colors.reset}`);
  console.log(`${colors.green}Successful registrations: ${successCount}${colors.reset}`);
  console.log(`${colors.red}Failed registrations: ${failureCount}${colors.reset}`);
  
  console.log(`\n${colors.yellow}Note: This test creates real data in your database.${colors.reset}`);
  console.log('To test the full flow:');
  console.log('1. Visit http://localhost:3000/auth/register-restaurant');
  console.log('2. Fill out the registration form');
  console.log('3. Check the verify-email page');
  console.log('4. Verify data in Supabase dashboard');
}

// Run the tests
runTests().catch(console.error);