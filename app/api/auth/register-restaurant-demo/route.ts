/**
 * HERA Universal - Restaurant Registration API (Demo Version)
 * 
 * Simplified registration for demo purposes - bypasses Supabase Auth
 * Creates only the necessary records in HERA tables
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

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

    // Generate IDs
    const userId = crypto.randomUUID();
    const orgId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const staffId = crypto.randomUUID();

    try {
      // Step 1: Check if user already exists
      const { data: existingUser } = await adminClient
        .from('core_users')
        .select('email')
        .eq('email', body.email)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      }

      // Step 2: Create organization (restaurant)
      const { error: orgError } = await adminClient
        .from('core_organizations')
        .insert({
          id: orgId,
          org_name: body.restaurantName,
          client_id: null,
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

      // Step 3: Create user profile (demo - no real auth user)
      const hashedPassword = await bcrypt.hash(body.password, 10);
      
      const { error: profileError } = await adminClient
        .from('core_users')
        .insert({
          id: profileId,
          auth_user_id: null, // No real auth user for demo
          email: body.email,
          full_name: body.email.split('@')[0].replace(/[._-]/g, ' '),
          user_role: body.role,
          is_active: true
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error('Failed to create user profile');
      }

      // Step 4: Store password hash in dynamic data (for demo login)
      await adminClient
        .from('core_dynamic_data')
        .insert({
          entity_id: profileId,
          field_name: 'password_hash',
          field_value: hashedPassword,
          field_type: 'text'
        });

      // Step 5: Link user to organization
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

      // Step 6: Create restaurant staff entity
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

      // Step 7: Add staff dynamic data
      const dynamicFields = [
        { entity_id: staffId, field_name: 'email', field_value: body.email, field_type: 'text' },
        { entity_id: staffId, field_name: 'role', field_value: body.role, field_type: 'text' },
        { entity_id: staffId, field_name: 'is_primary', field_value: 'true', field_type: 'boolean' },
        { entity_id: staffId, field_name: 'user_id', field_value: profileId, field_type: 'text' }
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
        console.error('Dynamic fields:', dynamicFields);
        throw new Error(`Failed to create staff data: ${dynamicError.message}`);
      }

      // Step 8: Deploy restaurant templates
      await deployRestaurantTemplates(adminClient, orgId);

      // Return success
      return NextResponse.json({
        success: true,
        data: {
          userId: profileId,
          organizationId: orgId,
          profileId,
          staffId,
          restaurantName: body.restaurantName,
          email: body.email,
          role: body.role,
          requiresEmailVerification: false
        },
        message: 'Registration successful! You can now log in to your restaurant.'
      }, { status: 201 });

    } catch (error) {
      // If any step fails, attempt to clean up
      console.error('Registration process error:', error);
      
      // Clean up any created records
      try {
        await adminClient.from('core_organizations').delete().eq('id', orgId);
        await adminClient.from('core_users').delete().eq('id', profileId);
        await adminClient.from('core_entities').delete().eq('id', staffId);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to complete registration' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
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