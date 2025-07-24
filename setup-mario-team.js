/**
 * HERA Mario's Restaurant Team Setup
 * 
 * This script helps Mario add team members to his restaurant organization
 * Demonstrates the complete workflow for user-organization management
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || 'your-service-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mario's Restaurant Organization ID
const MARIO_RESTAURANT_ORG_ID = '123e4567-e89b-12d3-a456-426614174000';

// Demo team members for Mario's Restaurant
const DEMO_TEAM_MEMBERS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440030',
    email: 'sofia.martinez@marios-restaurant.com',
    fullName: 'Sofia Martinez',
    role: 'manager', // Restaurant Manager
    userRole: 'restaurant_manager'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440031',
    email: 'giuseppe.rossi@marios-restaurant.com',
    fullName: 'Giuseppe Rossi',
    role: 'staff', // Head Chef
    userRole: 'chef'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440032',
    email: 'maria.gonzalez@marios-restaurant.com',
    fullName: 'Maria Gonzalez',
    role: 'staff', // Server
    userRole: 'server'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440033',
    email: 'michael.numbers@accounting-pros.com',
    fullName: 'Michael Numbers',
    role: 'accountant', // Restaurant Accountant
    userRole: 'accountant'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440034',
    email: 'sarah.books@marios-restaurant.com',
    fullName: 'Sarah Books',
    role: 'accountant', // Bookkeeper
    userRole: 'bookkeeper'
  }
];

async function createDemoUsers() {
  console.log('👥 Creating demo users for Mario\'s Restaurant...\n');

  for (const member of DEMO_TEAM_MEMBERS) {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('core_users')
        .select('id')
        .eq('id', member.id)
        .single();

      if (existingUser) {
        console.log(`✅ User ${member.fullName} already exists`);
        continue;
      }

      // Create user in core_users table
      const { data: newUser, error: userError } = await supabase
        .from('core_users')
        .insert({
          id: member.id,
          email: member.email,
          full_name: member.fullName,
          user_role: member.userRole,
          is_active: true
        })
        .select()
        .single();

      if (userError) {
        console.log(`❌ Failed to create user ${member.fullName}:`, userError.message);
        continue;
      }

      console.log(`✅ Created user: ${member.fullName} (${member.email})`);

    } catch (error) {
      console.log(`❌ Error creating user ${member.fullName}:`, error.message);
    }
  }
}

async function addUsersToOrganization() {
  console.log('\n🏢 Adding users to Mario\'s Restaurant organization...\n');

  for (const member of DEMO_TEAM_MEMBERS) {
    try {
      // Check if relationship already exists
      const { data: existingRelation } = await supabase
        .from('user_organizations')
        .select('id, role')
        .eq('user_id', member.id)
        .eq('organization_id', MARIO_RESTAURANT_ORG_ID)
        .single();

      if (existingRelation) {
        console.log(`✅ ${member.fullName} already in organization (${existingRelation.role})`);
        continue;
      }

      // Add user to organization
      const { data: newRelation, error: relationError } = await supabase
        .from('user_organizations')
        .insert({
          id: crypto.randomUUID(),
          user_id: member.id,
          organization_id: MARIO_RESTAURANT_ORG_ID,
          role: member.role,
          is_active: true
        })
        .select()
        .single();

      if (relationError) {
        console.log(`❌ Failed to add ${member.fullName} to organization:`, relationError.message);
        continue;
      }

      console.log(`✅ Added ${member.fullName} to organization as ${member.role}`);

    } catch (error) {
      console.log(`❌ Error adding ${member.fullName} to organization:`, error.message);
    }
  }
}

async function showOrganizationMembers() {
  console.log('\n📊 Mario\'s Restaurant Team Members:\n');

  try {
    // Get all user-organization relationships for Mario's restaurant
    const { data: relations, error } = await supabase
      .from('user_organizations')
      .select(`
        id,
        role,
        is_active,
        created_at,
        core_users (
          id,
          email,
          full_name,
          user_role
        )
      `)
      .eq('organization_id', MARIO_RESTAURANT_ORG_ID)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.log('❌ Error fetching team members:', error.message);
      return;
    }

    if (!relations || relations.length === 0) {
      console.log('No team members found.');
      return;
    }

    // Group by role
    const membersByRole = relations.reduce((acc, relation) => {
      const role = relation.role;
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push(relation);
      return acc;
    }, {});

    // Display members by role
    Object.entries(membersByRole).forEach(([role, members]) => {
      console.log(`🎭 ${role.toUpperCase()} (${members.length}):`);
      members.forEach(member => {
        const user = member.core_users;
        console.log(`   • ${user.full_name} (${user.email}) - ${user.user_role}`);
      });
      console.log('');
    });

    console.log(`📈 Total team members: ${relations.length}`);

  } catch (error) {
    console.log('❌ Error showing organization members:', error.message);
  }
}

async function testAPIEndpoints() {
  console.log('\n🧪 Testing API endpoints...\n');

  const API_BASE = 'http://localhost:3001/api';

  try {
    // Test GET endpoint
    console.log('📋 Testing GET /api/user-organizations');
    const response = await fetch(`${API_BASE}/user-organizations?organizationId=${MARIO_RESTAURANT_ORG_ID}&includeDetails=true`);
    const data = await response.json();

    console.log(`✅ API Response: ${response.status}`);
    console.log(`📊 Total members: ${data.summary?.total || 0}`);
    console.log(`🎭 By role:`, data.summary?.byRole || {});
    
    if (data.data && data.data.length > 0) {
      console.log('\n👥 Team members via API:');
      data.data.forEach(member => {
        console.log(`   • ${member.user?.fullName || 'Unknown'} - ${member.role}`);
      });
    }

  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }
}

async function runSetup() {
  console.log('🚀 Setting up Mario\'s Restaurant Team\n');
  console.log('================================================');

  try {
    // Step 1: Create demo users
    await createDemoUsers();

    // Step 2: Add users to organization
    await addUsersToOrganization();

    // Step 3: Show current team
    await showOrganizationMembers();

    // Step 4: Test API endpoints
    await testAPIEndpoints();

    console.log('\n🎉 Setup complete! Mario\'s restaurant team is ready.\n');

    // Show next steps
    console.log('📋 Next steps for Mario:');
    console.log('1. Use the API to add/remove team members as needed');
    console.log('2. Update user roles using the PUT endpoint');
    console.log('3. Filter team members by role for different views');
    console.log('4. Integrate with the restaurant dashboard for user management');

  } catch (error) {
    console.log('❌ Setup failed:', error.message);
  }
}

// Run setup if called directly
if (require.main === module) {
  runSetup();
}

module.exports = {
  createDemoUsers,
  addUsersToOrganization,
  showOrganizationMembers,
  testAPIEndpoints,
  runSetup,
  DEMO_TEAM_MEMBERS,
  MARIO_RESTAURANT_ORG_ID
};