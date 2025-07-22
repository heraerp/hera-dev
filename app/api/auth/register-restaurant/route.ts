/**
 * HERA Universal - Restaurant Registration API
 * 
 * Unified registration endpoint that creates:
 * 1. Supabase Auth user
 * 2. Core organization (restaurant)
 * 3. User profile in core_users
 * 4. User-organization relationship
 * 5. Restaurant staff entity
 * 6. Deploys restaurant templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for full access
const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing');
  }
  
  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
};

interface RegisterRestaurantRequest {
  restaurantName: string;
  email: string;
  password: string;
  role: 'owner' | 'manager';
  phone?: string;
  timezone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRestaurantRequest = await request.json();
    const adminClient = getAdminClient();

    // Validate required fields
    if (!body.restaurantName || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Create Supabase Auth user using admin method
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true, // Auto-confirm email for demo
      user_metadata: {
        restaurant_name: body.restaurantName,
        role: body.role
      }
    });

    if (authError || !authData.user) {
      console.error('Auth error:', authError);
      
      // Check if user already exists
      if (authError?.message?.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: authError?.message || 'Failed to create auth user' },
        { status: 400 }
      );
    }

    const userId = authData.user.id;
    const orgId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const staffId = crypto.randomUUID();

    try {
      // Step 2: Create organization (restaurant)
      const { error: orgError } = await adminClient
        .from('core_organizations')
        .insert({
          id: orgId,
          org_name: body.restaurantName,
          client_id: `REST-${Date.now()}`,
          org_code: body.restaurantName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10),
          industry: 'restaurant',
          country: 'US',
          currency: 'USD',
          is_active: true
        });

      if (orgError) {
        console.error('Organization error:', orgError);
        throw new Error('Failed to create organization');
      }

      // Step 3: Create user profile
      const { error: profileError } = await adminClient
        .from('core_users')
        .insert({
          id: profileId,
          auth_user_id: userId,
          email: body.email,
          full_name: body.email.split('@')[0].replace(/[._-]/g, ' '),
          user_role: body.role,
          is_active: true
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error('Failed to create user profile');
      }

      // Step 4: Link user to organization
      const { error: linkError } = await adminClient
        .from('user_organizations')
        .insert({
          user_id: profileId,
          organization_id: orgId,
          role: body.role,
          is_active: true
        });

      if (linkError) {
        console.error('Link error:', linkError);
        throw new Error('Failed to link user to organization');
      }

      // Step 5: Create restaurant staff entity
      const { error: staffError } = await adminClient
        .from('core_entities')
        .insert({
          id: staffId,
          organization_id: orgId,
          entity_type: 'restaurant_staff',
          entity_name: body.email.split('@')[0].replace(/[._-]/g, ' '),
          entity_code: `STAFF-${body.role.toUpperCase()}-${Date.now()}`,
          is_active: true
        });

      if (staffError) {
        console.error('Staff entity error:', staffError);
        throw new Error('Failed to create staff entity');
      }

      // Step 6: Add staff dynamic data
      const dynamicFields = [
        { entity_id: staffId, field_name: 'email', field_value: body.email, field_type: 'text' },
        { entity_id: staffId, field_name: 'role', field_value: body.role, field_type: 'text' },
        { entity_id: staffId, field_name: 'is_primary', field_value: 'true', field_type: 'boolean' },
        { entity_id: staffId, field_name: 'auth_user_id', field_value: userId, field_type: 'text' }
      ];

      if (body.phone) {
        dynamicFields.push({ 
          entity_id: staffId, 
          field_name: 'phone', 
          field_value: body.phone, 
          field_type: 'text' 
        });
      }

      const { error: dynamicError } = await adminClient
        .from('core_dynamic_data')
        .insert(dynamicFields);

      if (dynamicError) {
        console.error('Dynamic data error:', dynamicError);
        throw new Error('Failed to create staff data');
      }

      // Step 7: Deploy restaurant templates (simplified for now)
      await deployRestaurantTemplates(adminClient, orgId);

      // Return success with all necessary data
      return NextResponse.json({
        success: true,
        data: {
          userId,
          organizationId: orgId,
          profileId,
          staffId,
          restaurantName: body.restaurantName,
          email: body.email,
          role: body.role,
          requiresEmailVerification: false
        },
        message: 'Registration successful! Please check your email to verify your account.'
      }, { status: 201 });

    } catch (error) {
      // If any step fails, attempt to clean up
      console.error('Registration process error:', error);
      
      // Try to delete the auth user
      await adminClient.auth.admin.deleteUser(userId).catch(console.error);
      
      return NextResponse.json(
        { error: 'Failed to complete registration. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to deploy restaurant templates
async function deployRestaurantTemplates(client: any, organizationId: string) {
  try {
    // Create basic restaurant templates
    const templates = [
      {
        organization_id: organizationId,
        entity_type: 'supplier_template',
        entity_name: 'Restaurant Supplier Template',
        entity_code: `TMPL-SUPPLIER-${Date.now()}`
      },
      {
        organization_id: organizationId,
        entity_type: 'menu_item_template',
        entity_name: 'Restaurant Menu Item Template',
        entity_code: `TMPL-MENU-${Date.now()}`
      },
      {
        organization_id: organizationId,
        entity_type: 'inventory_template',
        entity_name: 'Restaurant Inventory Template',
        entity_code: `TMPL-INV-${Date.now()}`
      }
    ];

    await client
      .from('core_entities')
      .insert(templates);

    // Create default supplier categories
    const categories = [
      { name: 'Produce', code: 'PRODUCE' },
      { name: 'Meat & Seafood', code: 'MEAT_SEAFOOD' },
      { name: 'Dairy', code: 'DAIRY' },
      { name: 'Dry Goods', code: 'DRY_GOODS' },
      { name: 'Beverages', code: 'BEVERAGES' }
    ];

    for (const category of categories) {
      const categoryId = crypto.randomUUID();
      await client
        .from('core_entities')
        .insert({
          id: categoryId,
          organization_id: organizationId,
          entity_type: 'supplier_category',
          entity_name: category.name,
          entity_code: `CAT-${category.code}-${Date.now()}`
        });
    }

    return true;
  } catch (error) {
    console.error('Template deployment error:', error);
    // Non-critical error, don't fail registration
    return false;
  }
}