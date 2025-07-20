/**
 * HERA Digital Accountant - Three-Way Match Override API
 * 
 * Handles manual overrides for three-way match validation exceptions
 * Following Purchase Order API patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for bypassing RLS during development
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface OverrideRequest {
  reason: string;
  authorizedBy: string;
  overrideType: 'variance_exception' | 'missing_document' | 'emergency_payment' | 'other';
  varianceJustification?: string;
  approvalLevel?: 'manager' | 'director' | 'cfo';
  expiryDate?: string;
}

// PUT /api/digital-accountant/three-way-match/[id]/override
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { id: validationId } = await params;
    const body: OverrideRequest = await request.json();

    if (!validationId) {
      return NextResponse.json(
        { error: 'Validation ID is required', success: false },
        { status: 400 }
      );
    }

    // Validate request
    if (!body.reason || !body.authorizedBy || !body.overrideType) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: reason, authorizedBy, overrideType',
          success: false
        },
        { status: 400 }
      );
    }

    console.log('🔓 Processing three-way match override:', validationId, body);

    // Get the validation result entity
    const { data: validationEntity, error: fetchError } = await supabase
      .from('core_entities')
      .select(`
        *,
        core_dynamic_data(field_name, field_value)
      `)
      .eq('id', validationId)
      .eq('entity_type', 'three_way_match_result')
      .single();

    if (fetchError || !validationEntity) {
      return NextResponse.json(
        { error: 'Validation result not found', success: false },
        { status: 404 }
      );
    }

    // Extract validation data
    const validationData = (validationEntity.core_dynamic_data || []).reduce((acc: any, field: any) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {});

    const validationResult = validationData.validation_result ? 
      JSON.parse(validationData.validation_result) : {};

    // Create override entity
    const { data: overrideEntity, error: createError } = await supabase
      .from('core_entities')
      .insert({
        organization_id: validationEntity.organization_id,
        entity_type: 'validation_override',
        entity_name: `Override: ${validationEntity.entity_name}`,
        entity_code: `OVERRIDE_${validationId.slice(-8)}_${Date.now()}`,
        is_active: true
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating override entity:', createError);
      return NextResponse.json(
        { 
          error: 'Failed to create override',
          details: createError,
          success: false
        },
        { status: 500 }
      );
    }

    // Store override details
    const overrideData = [
      { entity_id: overrideEntity.id, field_name: 'validation_id', field_value: validationId, field_type: 'text' },
      { entity_id: overrideEntity.id, field_name: 'override_type', field_value: body.overrideType, field_type: 'text' },
      { entity_id: overrideEntity.id, field_name: 'override_reason', field_value: body.reason, field_type: 'text' },
      { entity_id: overrideEntity.id, field_name: 'authorized_by', field_value: body.authorizedBy, field_type: 'text' },
      { entity_id: overrideEntity.id, field_name: 'approval_level', field_value: body.approvalLevel || 'manager', field_type: 'text' },
      { entity_id: overrideEntity.id, field_name: 'override_timestamp', field_value: new Date().toISOString(), field_type: 'timestamp' },
      { entity_id: overrideEntity.id, field_name: 'original_status', field_value: validationData.control_status || 'failed', field_type: 'text' },
      { entity_id: overrideEntity.id, field_name: 'override_active', field_value: 'true', field_type: 'boolean' }
    ];

    if (body.varianceJustification) {
      overrideData.push({
        entity_id: overrideEntity.id,
        field_name: 'variance_justification',
        field_value: body.varianceJustification,
        field_type: 'text'
      });
    }

    if (body.expiryDate) {
      overrideData.push({
        entity_id: overrideEntity.id,
        field_name: 'expiry_date',
        field_value: body.expiryDate,
        field_type: 'date'
      });
    }

    const { error: dataError } = await supabase
      .from('core_dynamic_data')
      .insert(overrideData);

    if (dataError) {
      console.error('❌ Error storing override data:', dataError);
    }

    // Update the original validation result to reflect override
    await supabase
      .from('core_dynamic_data')
      .upsert([
        {
          entity_id: validationId,
          field_name: 'control_status',
          field_value: 'overridden',
          field_type: 'text',
          updated_at: new Date().toISOString()
        },
        {
          entity_id: validationId,
          field_name: 'override_id',
          field_value: overrideEntity.id,
          field_type: 'text',
          updated_at: new Date().toISOString()
        },
        {
          entity_id: validationId,
          field_name: 'remediation_required',
          field_value: 'false',
          field_type: 'boolean',
          updated_at: new Date().toISOString()
        }
      ], {
        onConflict: 'entity_id,field_name'
      });

    // Create relationship between validation and override
    await supabase
      .from('core_relationships')
      .insert({
        organization_id: validationEntity.organization_id,
        relationship_type: 'validation_override',
        relationship_name: 'Validation Override',
        parent_entity_id: validationId,
        child_entity_id: overrideEntity.id,
        is_active: true,
        created_by: body.authorizedBy,
        metadata: {
          override_type: body.overrideType,
          approval_level: body.approvalLevel || 'manager',
          reason: body.reason
        }
      });

    // Update the invoice status to allow payment despite failed validation
    if (validationResult.invoice_id) {
      await supabase
        .from('universal_transactions')
        .update({
          transaction_status: 'validated_override',
          updated_at: new Date().toISOString()
        })
        .eq('id', validationResult.invoice_id);

      // Log the override in transaction metadata
      await supabase
        .from('core_dynamic_data')
        .upsert({
          entity_id: validationResult.invoice_id,
          field_name: 'validation_override',
          field_value: JSON.stringify({
            override_id: overrideEntity.id,
            override_date: new Date().toISOString(),
            authorized_by: body.authorizedBy,
            reason: body.reason
          }),
          field_type: 'json',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'entity_id,field_name'
        });
    }

    // Create audit trail event
    await supabase
      .from('core_events')
      .insert({
        organization_id: validationEntity.organization_id,
        event_type: 'three_way_match_override',
        entity_id: overrideEntity.id,
        event_data: {
          validation_id: validationId,
          invoice_id: validationResult.invoice_id,
          override_type: body.overrideType,
          authorized_by: body.authorizedBy,
          approval_level: body.approvalLevel || 'manager',
          reason: body.reason,
          original_issues: validationResult.issues || [],
          variance_details: {
            po_amount: validationResult.po_amount,
            gr_amount: validationResult.gr_amount,
            invoice_amount: validationResult.invoice_amount
          }
        },
        created_at: new Date().toISOString()
      });

    console.log('✅ Three-way match override created successfully');

    return NextResponse.json({
      success: true,
      message: 'Three-way match validation overridden successfully',
      data: {
        overrideId: overrideEntity.id,
        validationId: validationId,
        invoiceId: validationResult.invoice_id,
        overrideType: body.overrideType,
        authorizedBy: body.authorizedBy,
        status: 'overridden',
        expiryDate: body.expiryDate || null
      }
    });

  } catch (error) {
    console.error('❌ Override error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}