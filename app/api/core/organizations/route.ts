/**
 * HERA Universal - Core Organizations API
 * 
 * Sacred Multi-Tenancy: Organization management API
 * Handles creation and management of organizations in the system
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for organization operations
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface OrganizationRequest {
  id?: string;
  org_name: string;
  org_code?: string;
  industry?: string;
  country?: string;
  currency?: string;
  client_id?: string;
  is_active?: boolean;
}

// GET /api/core/organizations - List organizations
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    
    const organizationId = searchParams.get('organizationId');
    const clientId = searchParams.get('clientId');
    const isActive = searchParams.get('isActive');
    
    let query = supabase
      .from('core_organizations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (organizationId) {
      query = query.eq('id', organizationId);
    }
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }
    
    const { data: organizations, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching organizations:', error);
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      data: {
        organizations: organizations || [],
        totalCount: organizations?.length || 0
      },
      message: 'Organizations fetched successfully'
    });

  } catch (error) {
    console.error('❌ Organizations fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch organizations' 
      },
      { status: 500 }
    );
  }
}

// POST /api/core/organizations - Create new organization
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: OrganizationRequest = await request.json();
    
    // Validate required fields
    if (!body.org_name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'org_name is required' 
        },
        { status: 400 }
      );
    }
    
    // Generate organization data
    const organizationId = body.id || crypto.randomUUID();
    const orgCode = body.org_code || generateOrgCode(body.org_name);
    
    console.log('🏢 Creating organization:', body.org_name);
    
    // Create organization record
    const organizationData = {
      id: organizationId,
      org_name: body.org_name,
      org_code: orgCode,
      industry: body.industry || 'general',
      country: body.country || 'United States',
      currency: body.currency || 'USD',
      client_id: body.client_id,
      is_active: body.is_active !== undefined ? body.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: organization, error: orgError } = await supabase
      .from('core_organizations')
      .insert(organizationData)
      .select()
      .single();
    
    if (orgError) {
      console.error('❌ Organization creation failed:', orgError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to create organization: ${orgError.message}` 
        },
        { status: 500 }
      );
    }
    
    console.log('✅ Organization created successfully:', organizationId);
    
    return NextResponse.json({
      success: true,
      data: organization,
      message: 'Organization created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Organization creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create organization' 
      },
      { status: 500 }
    );
  }
}

function generateOrgCode(orgName: string): string {
  const baseCode = orgName.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4);
  const random = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `${baseCode}${random}ORG`; // Max 10 chars: 4+2+3=9 chars
}