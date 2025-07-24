/**
 * HERA Universal - User Organizations API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Manages user-organization relationships with roles and permissions
 * Uses HERA's universal architecture for scalable user management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for demo/testing purposes
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// TypeScript interfaces
interface UserOrganizationRequest {
  userId: string;
  organizationId: string;
  role: 'owner' | 'manager' | 'staff' | 'accountant' | 'viewer';
  isActive?: boolean;
}

interface UserOrganizationResponse {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
  organization?: {
    id: string;
    name: string;
  };
}

// GET /api/user-organizations - Get all user-organization relationships
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const includeDetails = searchParams.get('includeDetails') === 'true';

    // Build query
    let query = supabase
      .from('user_organizations')
      .select('*')
      .eq('is_active', true);

    // Apply filters
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (role) {
      query = query.eq('role', role);
    }

    const { data: userOrgs, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user organizations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user organizations' },
        { status: 500 }
      );
    }

    let enrichedUserOrgs = userOrgs || [];

    // Include user and organization details if requested
    if (includeDetails && userOrgs && userOrgs.length > 0) {
      const userIds = [...new Set(userOrgs.map(uo => uo.user_id))];
      const orgIds = [...new Set(userOrgs.map(uo => uo.organization_id))];

      // Fetch user details
      const { data: users } = await supabase
        .from('core_users')
        .select('id, email, full_name')
        .in('id', userIds);

      // Fetch organization details
      const { data: organizations } = await supabase
        .from('core_organizations')
        .select('id, org_name')
        .in('id', orgIds);

      // Create lookup maps
      const userMap = new Map(users?.map(u => [u.id, u]) || []);
      const orgMap = new Map(organizations?.map(o => [o.id, o]) || []);

      // Enrich the data
      enrichedUserOrgs = userOrgs.map(userOrg => ({
        id: userOrg.id,
        userId: userOrg.user_id,
        organizationId: userOrg.organization_id,
        role: userOrg.role,
        isActive: userOrg.is_active,
        createdAt: userOrg.created_at,
        updatedAt: userOrg.updated_at,
        user: userMap.get(userOrg.user_id) ? {
          id: userMap.get(userOrg.user_id)!.id,
          email: userMap.get(userOrg.user_id)!.email,
          fullName: userMap.get(userOrg.user_id)!.full_name
        } : undefined,
        organization: orgMap.get(userOrg.organization_id) ? {
          id: orgMap.get(userOrg.organization_id)!.id,
          name: orgMap.get(userOrg.organization_id)!.org_name
        } : undefined
      }));
    } else {
      // Simple format without details
      enrichedUserOrgs = userOrgs.map(userOrg => ({
        id: userOrg.id,
        userId: userOrg.user_id,
        organizationId: userOrg.organization_id,
        role: userOrg.role,
        isActive: userOrg.is_active,
        createdAt: userOrg.created_at,
        updatedAt: userOrg.updated_at
      }));
    }

    return NextResponse.json({
      success: true,
      data: enrichedUserOrgs,
      summary: {
        total: enrichedUserOrgs.length,
        byRole: enrichedUserOrgs.reduce((acc, uo) => {
          acc[uo.role] = (acc[uo.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error('User organizations GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/user-organizations - Add user to organization
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: UserOrganizationRequest = await request.json();

    // Validate request
    if (!body.userId || !body.organizationId || !body.role) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, organizationId, role' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['owner', 'manager', 'staff', 'accountant', 'viewer'];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('core_users')
      .select('id, email, full_name')
      .eq('id', body.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if organization exists
    const { data: organization, error: orgError } = await supabase
      .from('core_organizations')
      .select('id, org_name')
      .eq('id', body.organizationId)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check if relationship already exists
    const { data: existingRelation } = await supabase
      .from('user_organizations')
      .select('id, role, is_active')
      .eq('user_id', body.userId)
      .eq('organization_id', body.organizationId)
      .single();

    if (existingRelation) {
      if (existingRelation.is_active) {
        return NextResponse.json(
          { 
            error: 'User is already a member of this organization',
            currentRole: existingRelation.role
          },
          { status: 409 }
        );
      } else {
        // Reactivate existing relationship with new role
        const { data: updatedRelation, error: updateError } = await supabase
          .from('user_organizations')
          .update({
            role: body.role,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRelation.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error reactivating user organization:', updateError);
          return NextResponse.json(
            { error: 'Failed to reactivate user organization' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            id: updatedRelation.id,
            userId: updatedRelation.user_id,
            organizationId: updatedRelation.organization_id,
            role: updatedRelation.role,
            isActive: updatedRelation.is_active,
            createdAt: updatedRelation.created_at,
            updatedAt: updatedRelation.updated_at,
            user: {
              id: user.id,
              email: user.email,
              fullName: user.full_name
            },
            organization: {
              id: organization.id,
              name: organization.org_name
            }
          },
          message: 'User reactivated in organization successfully'
        }, { status: 200 });
      }
    }

    // Create new user-organization relationship
    const userOrgId = crypto.randomUUID();
    
    const { data: newUserOrg, error: createError } = await supabase
      .from('user_organizations')
      .insert({
        id: userOrgId,
        user_id: body.userId,
        organization_id: body.organizationId,
        role: body.role,
        is_active: body.isActive !== undefined ? body.isActive : true
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating user organization:', createError);
      return NextResponse.json(
        { error: 'Failed to add user to organization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newUserOrg.id,
        userId: newUserOrg.user_id,
        organizationId: newUserOrg.organization_id,
        role: newUserOrg.role,
        isActive: newUserOrg.is_active,
        createdAt: newUserOrg.created_at,
        updatedAt: newUserOrg.updated_at,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name
        },
        organization: {
          id: organization.id,
          name: organization.org_name
        }
      },
      message: 'User added to organization successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('User organizations POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user-organizations - Update user role in organization
export async function PUT(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();

    if (!body.id || !body.role) {
      return NextResponse.json(
        { error: 'Missing required fields: id, role' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['owner', 'manager', 'staff', 'accountant', 'viewer'];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Update the user organization relationship
    const { data: updatedUserOrg, error } = await supabase
      .from('user_organizations')
      .update({
        role: body.role,
        is_active: body.isActive !== undefined ? body.isActive : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user organization:', error);
      return NextResponse.json(
        { error: 'Failed to update user organization' },
        { status: 500 }
      );
    }

    if (!updatedUserOrg) {
      return NextResponse.json(
        { error: 'User organization relationship not found' },
        { status: 404 }
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
    console.error('User organizations PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/user-organizations - Remove user from organization (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const organizationId = searchParams.get('organizationId');

    if (!id && (!userId || !organizationId)) {
      return NextResponse.json(
        { error: 'Must provide either id or both userId and organizationId' },
        { status: 400 }
      );
    }

    let query = supabase.from('user_organizations');

    if (id) {
      query = query.eq('id', id);
    } else {
      query = query.eq('user_id', userId).eq('organization_id', organizationId);
    }

    // Soft delete by setting is_active to false
    const { data: deletedUserOrg, error } = await query
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error removing user from organization:', error);
      return NextResponse.json(
        { error: 'Failed to remove user from organization' },
        { status: 500 }
      );
    }

    if (!deletedUserOrg) {
      return NextResponse.json(
        { error: 'User organization relationship not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User removed from organization successfully'
    });

  } catch (error) {
    console.error('User organizations DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}