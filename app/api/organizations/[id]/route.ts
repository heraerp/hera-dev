/**
 * HERA Universal - Organization Details API
 * 
 * Next.js 15 App Router API Route Handler
 * Fetches individual organization details from core_organizations table
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

// GET /api/organizations/[id] - Get specific organization
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const { id } = params;

    // Get organization details
    const { data: organization, error } = await supabase
      .from('core_organizations')
      .select('id, org_name, client_id, org_code, industry, country, currency, is_active, created_at')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching organization:', error);
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: organization.id,
        name: organization.org_name,
        clientId: organization.client_id,
        code: organization.org_code,
        industry: organization.industry,
        country: organization.country,
        currency: organization.currency,
        isActive: organization.is_active,
        createdAt: organization.created_at
      }
    });

  } catch (error) {
    console.error('Organization GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[id] - Update organization
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const { id } = params;
    const body = await request.json();

    // Update organization
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.name) updateData.org_name = body.name;
    if (body.industry) updateData.industry = body.industry;
    if (body.country) updateData.country = body.country;
    if (body.currency) updateData.currency = body.currency;

    const { data: updatedOrganization, error } = await supabase
      .from('core_organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating organization:', error);
      return NextResponse.json(
        { error: 'Failed to update organization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrganization.id,
        name: updatedOrganization.org_name,
        industry: updatedOrganization.industry,
        country: updatedOrganization.country,
        currency: updatedOrganization.currency
      },
      message: 'Organization updated successfully'
    });

  } catch (error) {
    console.error('Organization PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}