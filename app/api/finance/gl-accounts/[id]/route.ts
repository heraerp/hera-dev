/**
 * HERA Universal - GL Account Individual Operations API
 * 
 * Next.js 15 App Router API Route Handler
 * Handles individual GL account operations (GET, PUT, DELETE)
 * Uses HERA's 5-table universal architecture
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

interface GLAccountUpdateRequest {
  accountName?: string;
  accountType?: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COST_OF_SALES' | 
                 'DIRECT_EXPENSE' | 'INDIRECT_EXPENSE' | 'TAX_EXPENSE' | 'EXTRAORDINARY_EXPENSE';
  isActive?: boolean;
  allowPosting?: boolean;
  description?: string;
  budgetAmount?: number;
  currentBalance?: number;
}

// GET /api/finance/gl-accounts/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    console.log('📖 Fetching GL account:', params.id);

    // CORE PATTERN: Get entity first
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', organizationId) // SACRED
      .eq('entity_type', 'chart_of_account')
      .single();

    if (entityError || !entity) {
      return NextResponse.json(
        { error: 'GL account not found' },
        { status: 404 }
      );
    }

    // CORE PATTERN: Get dynamic data
    const { data: dynamicData } = await supabase
      .from('core_dynamic_data')
      .select('field_name, field_value')
      .eq('entity_id', params.id);

    // CORE PATTERN: Group dynamic data
    const metadata = (dynamicData || []).reduce((acc, item) => {
      acc[item.field_name] = item.field_value;
      return acc;
    }, {} as Record<string, any>);

    // CORE PATTERN: Combine entity with dynamic data
    const enrichedAccount = {
      id: entity.id,
      accountCode: entity.entity_code,
      accountName: entity.entity_name,
      accountType: metadata.account_type || 'ASSET',
      isActive: entity.is_active,
      allowPosting: metadata.allow_posting === 'true',
      currentBalance: parseFloat(metadata.current_balance || '0'),
      lastUsed: metadata.last_used_date || null,
      usageCount: parseInt(metadata.usage_count || '0'),
      ytdActivity: parseFloat(metadata.ytd_activity || '0'),
      description: metadata.description || '',
      openingBalance: parseFloat(metadata.opening_balance || '0'),
      budgetAmount: parseFloat(metadata.budget_amount || '0'),
      parentAccount: metadata.parent_account || null,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at
    };

    console.log('✅ GL account retrieved successfully');

    return NextResponse.json({
      data: enrichedAccount,
      success: true
    });

  } catch (error) {
    console.error('❌ GL account GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/finance/gl-accounts/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const body: GLAccountUpdateRequest = await request.json();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    console.log('📝 Updating GL account:', params.id);

    // CORE PATTERN: Verify entity exists and belongs to organization
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('id')
      .eq('id', params.id)
      .eq('organization_id', organizationId) // SACRED
      .eq('entity_type', 'chart_of_account')
      .single();

    if (entityError || !entity) {
      return NextResponse.json(
        { error: 'GL account not found' },
        { status: 404 }
      );
    }

    // CORE PATTERN: Update entity fields if provided
    const entityUpdates: any = {};
    if (body.accountName) entityUpdates.entity_name = body.accountName;
    if (body.isActive !== undefined) entityUpdates.is_active = body.isActive;
    
    if (Object.keys(entityUpdates).length > 0) {
      entityUpdates.updated_at = new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from('core_entities')
        .update(entityUpdates)
        .eq('id', params.id);

      if (updateError) {
        console.error('❌ Error updating entity:', updateError);
        return NextResponse.json(
          { error: 'Failed to update GL account' },
          { status: 500 }
        );
      }
    }

    // CORE PATTERN: Update dynamic data fields
    const dynamicUpdates = [];
    
    if (body.accountType) {
      dynamicUpdates.push({
        entity_id: params.id,
        field_name: 'account_type',
        field_value: body.accountType,
        field_type: 'text'
      });
    }
    
    if (body.allowPosting !== undefined) {
      dynamicUpdates.push({
        entity_id: params.id,
        field_name: 'allow_posting',
        field_value: body.allowPosting.toString(),
        field_type: 'boolean'
      });
    }
    
    if (body.currentBalance !== undefined) {
      dynamicUpdates.push({
        entity_id: params.id,
        field_name: 'current_balance',
        field_value: body.currentBalance.toString(),
        field_type: 'number'
      });
    }
    
    if (body.budgetAmount !== undefined) {
      dynamicUpdates.push({
        entity_id: params.id,
        field_name: 'budget_amount',
        field_value: body.budgetAmount.toString(),
        field_type: 'number'
      });
    }
    
    if (body.description) {
      dynamicUpdates.push({
        entity_id: params.id,
        field_name: 'description',
        field_value: body.description,
        field_type: 'text'
      });
    }

    // CORE PATTERN: Upsert dynamic data
    for (const update of dynamicUpdates) {
      await supabase
        .from('core_dynamic_data')
        .upsert(update, {
          onConflict: 'entity_id,field_name',
          ignoreDuplicates: false
        });
    }

    console.log('✅ GL account updated successfully');

    return NextResponse.json({
      success: true,
      message: 'GL account updated successfully'
    });

  } catch (error) {
    console.error('❌ GL account PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/finance/gl-accounts/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Soft deleting GL account:', params.id);

    // CORE PATTERN: Soft delete by setting is_active = false
    const { data: entity, error: deleteError } = await supabase
      .from('core_entities')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('organization_id', organizationId) // SACRED
      .eq('entity_type', 'chart_of_account')
      .select()
      .single();

    if (deleteError || !entity) {
      return NextResponse.json(
        { error: 'GL account not found or cannot be deleted' },
        { status: 404 }
      );
    }

    console.log('✅ GL account soft deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'GL account deactivated successfully'
    });

  } catch (error) {
    console.error('❌ GL account DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}