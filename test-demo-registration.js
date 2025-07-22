/**
 * Test Demo Registration
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

console.log('Testing Demo Registration...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRegistration() {
  const testData = {
    restaurantName: 'Test Demo Restaurant',
    email: `test-${Date.now()}@demo.com`,
    password: 'testpass123',
    role: 'owner'
  };

  try {
    // Generate IDs
    const userId = crypto.randomUUID();
    const orgId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const staffId = crypto.randomUUID();

    console.log('Generated IDs:', { userId, orgId, profileId, staffId });

    // Step 1: Create organization
    console.log('\n1. Creating organization...');
    const { error: orgError } = await supabase
      .from('core_organizations')
      .insert({
        id: orgId,
        org_name: testData.restaurantName,
        client_id: crypto.randomUUID(),
        org_code: testData.restaurantName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10),
        industry: 'restaurant',
        country: 'US',
        currency: 'USD',
        is_active: true
      });

    if (orgError) {
      console.error('❌ Organization error:', orgError);
      return;
    }
    console.log('✅ Organization created');

    // Step 2: Create user profile
    console.log('\n2. Creating user profile...');
    const { error: profileError } = await supabase
      .from('core_users')
      .insert({
        id: profileId,
        auth_user_id: userId,
        email: testData.email,
        full_name: testData.email.split('@')[0].replace(/[._-]/g, ' '),
        user_role: testData.role,
        is_active: true
      });

    if (profileError) {
      console.error('❌ Profile error:', profileError);
      return;
    }
    console.log('✅ User profile created');

    // Step 3: Link to organization
    console.log('\n3. Linking user to organization...');
    const { error: linkError } = await supabase
      .from('user_organizations')
      .insert({
        user_id: profileId,
        organization_id: orgId,
        role: testData.role,
        is_active: true
      });

    if (linkError) {
      console.error('❌ Link error:', linkError);
      return;
    }
    console.log('✅ User linked to organization');

    // Step 4: Create staff entity
    console.log('\n4. Creating staff entity...');
    const { error: staffError } = await supabase
      .from('core_entities')
      .insert({
        id: staffId,
        organization_id: orgId,
        entity_type: 'restaurant_staff',
        entity_name: testData.email.split('@')[0].replace(/[._-]/g, ' '),
        entity_code: `STAFF-${testData.role.toUpperCase()}-${Date.now()}`,
        is_active: true
      });

    if (staffError) {
      console.error('❌ Staff entity error:', staffError);
      return;
    }
    console.log('✅ Staff entity created');

    // Step 5: Add dynamic data
    console.log('\n5. Adding dynamic data...');
    const hashedPassword = await bcrypt.hash(testData.password, 10);

    const dynamicFields = [
      { entity_id: profileId, field_name: 'password_hash', field_value: hashedPassword, field_type: 'text' },
      { entity_id: staffId, field_name: 'email', field_value: testData.email, field_type: 'text' },
      { entity_id: staffId, field_name: 'role', field_value: testData.role, field_type: 'text' },
      { entity_id: staffId, field_name: 'is_primary', field_value: 'true', field_type: 'boolean' },
      { entity_id: staffId, field_name: 'user_id', field_value: profileId, field_type: 'text' }
    ];

    const { error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .insert(dynamicFields);

    if (dynamicError) {
      console.error('❌ Dynamic data error:', dynamicError);
      return;
    }
    console.log('✅ Dynamic data added');

    console.log('\n🎉 Registration test successful!');
    console.log('Test data:', {
      restaurantName: testData.restaurantName,
      email: testData.email,
      organizationId: orgId,
      userId: profileId
    });

    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('core_dynamic_data').delete().eq('entity_id', profileId);
    await supabase.from('core_dynamic_data').delete().eq('entity_id', staffId);
    await supabase.from('user_organizations').delete().eq('id', profileId);
    await supabase.from('core_entities').delete().eq('id', staffId);
    await supabase.from('core_users').delete().eq('id', profileId);
    await supabase.from('core_organizations').delete().eq('id', orgId);
    console.log('✅ Cleanup complete');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testRegistration();