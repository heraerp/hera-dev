/**
 * HERA Universal - Individual User Organization API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Manages individual user-organization relationships
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for demo/testing purposes
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// GET /api/user-organizations/[id] - Get specific user-organization relationship
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('includeDetails') === 'true';

    // Get the user-organization relationship
    const { data: userOrg, error } = await supabase
      .from('user_organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !userOrg) {
      return NextResponse.json(
        { error: 'User organization relationship not found' },
        { status: 404 }
      );
    }

    let response = {
      id: userOrg.id,
      userId: userOrg.user_id,
      organizationId: userOrg.organization_id,
      role: userOrg.role,
      isActive: userOrg.is_active,
      createdAt: userOrg.created_at,
      updatedAt: userOrg.updated_at
    };

    // Include user and organization details if requested
    if (includeDetails) {
      // Fetch user details
      const { data: user } = await supabase
        .from('core_users')
        .select('id, email, full_name')
        .eq('id', userOrg.user_id)
        .single();

      // Fetch organization details
      const { data: organization } = await supabase
        .from('core_organizations')
        .select('id, org_name')
        .eq('id', userOrg.organization_id)
        .single();

      response = {
        ...response,
        user: user ? {
          id: user.id,
          email: user.email,
          fullName: user.full_name
        } : undefined,
        organization: organization ? {
          id: organization.id,
          name: organization.org_name
        } : undefined
      } as any;
    }

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('User organization GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user-organizations/[id] - Update specific user-organization relationship
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const { id } = params;
    const body = await request.json();

    // Validate role if provided
    if (body.role) {
      const validRoles = ['owner', 'manager', 'staff', 'accountant', 'viewer'];
      if (!validRoles.includes(body.role)) {
        return NextResponse.json(
          { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Check if relationship exists
    const { data: existingUserOrg, error: checkError } = await supabase
      .from('user_organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingUserOrg) {
      return NextResponse.json(
        { error: 'User organization relationship not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.role !== undefined) {
      updateData.role = body.role;
    }

    if (body.isActive !== undefined) {
      updateData.is_active = body.isActive;
    }

    // Update the relationship
    const { data: updatedUserOrg, error } = await supabase
      .from('user_organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user organization:', error);
      return NextResponse.json(
        { error: 'Failed to update user organization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUserOrg.id,
        userId: updatedUserOrg.user_id,
        organizationId: updatedUserOrg.organization_id,
        role: updatedUserOrg.role,
        isActive: updatedUserOrg.is_active,
        createdAt: updatedUserOrg.created_at,
        updatedAt: updatedUserOrg.updated_at
      },
      message: 'User organization updated successfully'
    });

  } catch (error) {
    console.error('User organization PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/user-organizations/[id] - Remove user from organization (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const { id } = params;

    // Check if relationship exists
    const { data: existingUserOrg, error: checkError } = await supabase
      .from('user_organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingUserOrg) {
      return NextResponse.json(
        { error: 'User organization relationship not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting is_active to false
    const { data: deletedUserOrg, error } = await supabase
      .from('user_organizations')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error removing user from organization:', error);
      return NextResponse.json(
        { error: 'Failed to remove user from organization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: deletedUserOrg.id,
        userId: deletedUserOrg.user_id,
        organizationId: deletedUserOrg.organization_id,
        role: deletedUserOrg.role,
        isActive: deletedUserOrg.is_active,
        updatedAt: deletedUserOrg.updated_at
      },
      message: 'User removed from organization successfully'
    });

  } catch (error) {
    console.error('User organization DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}