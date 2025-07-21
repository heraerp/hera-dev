/**
 * HERA Universal - Individual Cash Market Vendor API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Handles GET, PUT, DELETE for individual vendors
 * Uses HERA's universal architecture with organization isolation
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

// GET /api/cash-market/vendors/[id]
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

    // Get vendor entity with organization isolation
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .eq('entity_type', 'cash_market_vendor')
      .single();

    if (entityError || !entity) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Get dynamic data for this vendor
    const { data: dynamicData } = await supabase
      .from('core_dynamic_data')
      .select('field_name, field_value, field_type')
      .eq('entity_id', params.id);

    // Transform dynamic data into object
    const vendorData = (dynamicData || []).reduce((acc, item) => {
      let value = item.field_value;
      
      // Parse JSON fields
      if (item.field_type === 'json' && value) {
        try {
          value = JSON.parse(value);
        } catch {
          // Keep as string if parse fails
        }
      }
      
      // Parse number fields
      if (item.field_type === 'number' && value) {
        value = parseFloat(value);
      }
      
      acc[item.field_name] = value;
      return acc;
    }, {} as Record<string, any>);

    // Get transaction history for this vendor
    const { data: transactions } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'cash_market_purchase')
      .order('transaction_date', { ascending: false })
      .limit(20);

    // Filter transactions for this vendor
    const vendorTransactions = transactions?.filter(t => {
      try {
        const data = typeof t.transaction_data === 'string' ? JSON.parse(t.transaction_data) : t.transaction_data;
        return data?.vendorId === params.id;
      } catch {
        return false;
      }
    }) || [];

    // Calculate vendor statistics
    const totalSpent = vendorTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
    const averageOrder = vendorTransactions.length > 0 ? totalSpent / vendorTransactions.length : 0;
    const lastTransaction = vendorTransactions.length > 0 ? vendorTransactions[0].transaction_date : null;

    // Get vendor relationships
    const { data: relationships } = await supabase
      .from('core_relationships')
      .select('*')
      .eq('organization_id', organizationId)
      .or(`parent_entity_id.eq.${params.id},child_entity_id.eq.${params.id}`)
      .eq('is_active', true);

    return NextResponse.json({
      data: {
        id: entity.id,
        name: entity.entity_name,
        code: entity.entity_code,
        ...vendorData,
        statistics: {
          totalTransactions: vendorTransactions.length,
          totalSpent,
          averageOrder,
          lastTransaction
        },
        recentTransactions: vendorTransactions.slice(0, 10),
        relationships: relationships || [],
        isActive: entity.is_active,
        createdAt: entity.created_at,
        updatedAt: entity.updated_at
      }
    });

  } catch (error) {
    console.error('Vendor GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/cash-market/vendors/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { organizationId, name, ...dynamicFields } = body;
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Verify vendor exists and belongs to organization
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('id')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .eq('entity_type', 'cash_market_vendor')
      .single();

    if (entityError || !entity) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Update entity name if provided
    if (name) {
      const { error: updateError } = await supabase
        .from('core_entities')
        .update({ 
          entity_name: name,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (updateError) {
        console.error('Error updating vendor entity:', updateError);
        return NextResponse.json(
          { error: 'Failed to update vendor' },
          { status: 500 }
        );
      }
    }

    // Update dynamic fields
    const fieldsToUpdate = Object.entries(dynamicFields).filter(([key, value]) => 
      value !== undefined && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt'
    );

    for (const [fieldName, fieldValue] of fieldsToUpdate) {
      let processedValue = fieldValue;
      let fieldType = 'text';

      // Determine field type and process value
      if (typeof fieldValue === 'object' && fieldValue !== null) {
        processedValue = JSON.stringify(fieldValue);
        fieldType = 'json';
      } else if (typeof fieldValue === 'number') {
        processedValue = fieldValue.toString();
        fieldType = 'number';
      } else if (typeof fieldValue === 'boolean') {
        processedValue = fieldValue.toString();
        fieldType = 'boolean';
      }

      // Upsert dynamic data field
      const { error: upsertError } = await supabase
        .from('core_dynamic_data')
        .upsert({
          entity_id: params.id,
          field_name: fieldName,
          field_value: processedValue,
          field_type: fieldType,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'entity_id,field_name'
        });

      if (upsertError) {
        console.error(`Error updating field ${fieldName}:`, upsertError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Vendor updated successfully',
      data: { id: params.id, name: name || undefined }
    });

  } catch (error) {
    console.error('Vendor PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/cash-market/vendors/[id]
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

    // Verify vendor exists and belongs to organization
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('id, entity_name')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .eq('entity_type', 'cash_market_vendor')
      .single();

    if (entityError || !entity) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Check if vendor has any transactions
    const { data: transactions } = await supabase
      .from('universal_transactions')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'cash_market_purchase')
      .limit(1);

    const hasTransactions = transactions?.some(t => {
      try {
        const data = typeof t.transaction_data === 'string' ? JSON.parse(t.transaction_data) : t.transaction_data;
        return data?.vendorId === params.id;
      } catch {
        return false;
      }
    });

    if (hasTransactions) {
      // Soft delete - mark as inactive instead of actual deletion
      const { error: softDeleteError } = await supabase
        .from('core_entities')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (softDeleteError) {
        console.error('Error soft deleting vendor:', softDeleteError);
        return NextResponse.json(
          { error: 'Failed to deactivate vendor' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Vendor deactivated successfully (has transaction history)',
        action: 'deactivated'
      });
    } else {
      // Hard delete - remove vendor and all related data
      await supabase.from('core_dynamic_data').delete().eq('entity_id', params.id);
      await supabase.from('core_relationships').delete().or(`parent_entity_id.eq.${params.id},child_entity_id.eq.${params.id}`);
      
      const { error: deleteError } = await supabase
        .from('core_entities')
        .delete()
        .eq('id', params.id);

      if (deleteError) {
        console.error('Error deleting vendor:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete vendor' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Vendor deleted successfully',
        action: 'deleted'
      });
    }

  } catch (error) {
    console.error('Vendor DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}