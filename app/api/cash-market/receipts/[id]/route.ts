/**
 * HERA Universal - Individual Cash Market Receipt API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Handles GET, PUT, DELETE for individual receipts
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

// GET /api/cash-market/receipts/[id]
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

    // Get receipt entity with organization isolation
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .eq('entity_type', 'cash_market_receipt')
      .single();

    if (entityError || !entity) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      );
    }

    // Get dynamic data for this receipt
    const { data: dynamicData } = await supabase
      .from('core_dynamic_data')
      .select('field_name, field_value, field_type')
      .eq('entity_id', params.id);

    // Transform dynamic data into object
    const receiptData = (dynamicData || []).reduce((acc, item) => {
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

    // Get vendor information if linked
    const vendorId = receiptData.vendorId;
    let vendor = null;
    if (vendorId) {
      const { data: vendorData } = await supabase
        .from('core_entities')
        .select('id, entity_name, entity_code')
        .eq('id', vendorId)
        .eq('organization_id', organizationId)
        .eq('entity_type', 'cash_market_vendor')
        .single();
      
      if (vendorData) {
        vendor = {
          id: vendorData.id,
          name: vendorData.entity_name,
          code: vendorData.entity_code
        };
      }
    }

    // Get transaction information if linked
    const { data: transactionRelationship } = await supabase
      .from('core_relationships')
      .select('parent_entity_id, relationship_data')
      .eq('organization_id', organizationId)
      .eq('relationship_type', 'transaction_receipt')
      .eq('child_entity_id', params.id)
      .single();

    let transaction = null;
    if (transactionRelationship) {
      const { data: transactionData } = await supabase
        .from('universal_transactions')
        .select('id, transaction_number, total_amount, transaction_status, transaction_date')
        .eq('id', transactionRelationship.parent_entity_id)
        .eq('organization_id', organizationId)
        .single();
      
      if (transactionData) {
        transaction = {
          id: transactionData.id,
          number: transactionData.transaction_number,
          amount: transactionData.total_amount,
          status: transactionData.transaction_status,
          date: transactionData.transaction_date
        };
      }
    }

    // Get all relationships for this receipt
    const { data: relationships } = await supabase
      .from('core_relationships')
      .select('*')
      .eq('organization_id', organizationId)
      .or(`parent_entity_id.eq.${params.id},child_entity_id.eq.${params.id}`)
      .eq('is_active', true);

    return NextResponse.json({
      data: {
        id: entity.id,
        filename: receiptData.filename || entity.entity_name,
        code: entity.entity_code,
        imageUrl: receiptData.imageUrl || '',
        uploadedBy: receiptData.uploadedBy || '',
        processingStatus: receiptData.processingStatus || 'processing',
        aiProcessingData: receiptData.aiProcessingData || {},
        vendor,
        transaction,
        relationships: relationships || [],
        notes: receiptData.notes || '',
        isActive: entity.is_active,
        createdAt: entity.created_at,
        updatedAt: entity.updated_at,
        ...receiptData
      }
    });

  } catch (error) {
    console.error('Receipt GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/cash-market/receipts/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    const { organizationId, filename, ...dynamicFields } = body;
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Verify receipt exists and belongs to organization
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('id')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .eq('entity_type', 'cash_market_receipt')
      .single();

    if (entityError || !entity) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      );
    }

    // Update entity name if filename is provided
    if (filename) {
      const { error: updateError } = await supabase
        .from('core_entities')
        .update({ 
          entity_name: filename,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (updateError) {
        console.error('Error updating receipt entity:', updateError);
        return NextResponse.json(
          { error: 'Failed to update receipt' },
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
      message: 'Receipt updated successfully',
      data: { id: params.id, filename: filename || undefined }
    });

  } catch (error) {
    console.error('Receipt PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/cash-market/receipts/[id]
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

    // Verify receipt exists and belongs to organization
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('id, entity_name')
      .eq('id', params.id)
      .eq('organization_id', organizationId)
      .eq('entity_type', 'cash_market_receipt')
      .single();

    if (entityError || !entity) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      );
    }

    // Check if receipt is linked to any transactions
    const { data: transactionRelationships } = await supabase
      .from('core_relationships')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('relationship_type', 'transaction_receipt')
      .eq('child_entity_id', params.id)
      .limit(1);

    if (transactionRelationships && transactionRelationships.length > 0) {
      // Soft delete - mark as inactive instead of actual deletion
      const { error: softDeleteError } = await supabase
        .from('core_entities')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (softDeleteError) {
        console.error('Error soft deleting receipt:', softDeleteError);
        return NextResponse.json(
          { error: 'Failed to deactivate receipt' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Receipt deactivated successfully (linked to transactions)',
        action: 'deactivated'
      });
    } else {
      // Hard delete - remove receipt and all related data
      await supabase.from('core_dynamic_data').delete().eq('entity_id', params.id);
      await supabase.from('core_relationships').delete().or(`parent_entity_id.eq.${params.id},child_entity_id.eq.${params.id}`);
      
      const { error: deleteError } = await supabase
        .from('core_entities')
        .delete()
        .eq('id', params.id);

      if (deleteError) {
        console.error('Error deleting receipt:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete receipt' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Receipt deleted successfully',
        action: 'deleted'
      });
    }

  } catch (error) {
    console.error('Receipt DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}